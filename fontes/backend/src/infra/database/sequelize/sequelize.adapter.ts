import {
	Association,
	BelongsTo,
	HasMany,
	HasOne,
	IncludeOptions,
	Model,
	ModelStatic,
	Sequelize,
	Transaction,
	WhereOptions
} from 'sequelize';
import {
	IDatabaseAdapter,
	OrderDirection,
	OrderOption
} from '../IDatabase.adapter';
import { buildCustomQuery } from './customQuery';
import { FilterValue } from '../iFilterValue';
import { NotFoundError } from '../../../errors/client.error';
import { InternalServerError } from '../../../errors/internal.error';

/**
 * Implementação das funcionalidades do banco de dados com uso da biblioteca Sequelize
 */
export class SequelizeAdapter<TInterface, TClass>
	implements IDatabaseAdapter<TInterface, TClass>
{
	private _model: ModelStatic<any>;
	private _databaseType: string;
	private _databaseConnection: Sequelize;

	defaultOrderOptions: [string, OrderDirection][] = [['createdAt', 'DESC']];

	constructor(
		model: any,
		databaseType: string,
		databaseConnection: Sequelize,
		protected jsonDataToResourceFn: (jsonData: any) => TClass
	) {
		this._model = model;
		this._databaseType = databaseType;
		this._databaseConnection = databaseConnection;
	}

	get databaseType() {
		return this._databaseType;
	}

	get model() {
		return this._model;
	}

	get databaseConnection(): Sequelize {
		return this._databaseConnection;
	}

	async create(
		data: TInterface,
		options?: { transaction?: Transaction }
	): Promise<TClass> {
		let transaction = options?.transaction;
		const isRootTransaction = !transaction;

		try {
			if (isRootTransaction) {
				transaction = await this._databaseConnection.transaction();
			}

			if (!transaction) {
				throw new InternalServerError('Transaction not found');
			}

			// Processa associações BelongsTo primeiro
			const processedData = await this.processBelongsToAssociations(
				data,
				transaction
			);

			// Cria o registro principal
			const newItem = await this._model.create(processedData, { transaction });

			// Verifica se o objeto a ser registrado no banco de dados possúi um id já definido
			if (typeof data === 'object' && data !== null && 'id' in data) {
				await this.resincronizeSequence(
					'public',
					this._model.tableName,
					transaction
				);
			}

			// Processa associações HasMany e HasOne
			await this.processHasAssociations(data, newItem, transaction);

			if (isRootTransaction) {
				await transaction.commit();
			}

			return this.jsonDataToResourceFn(newItem.get({ plain: true }));
		} catch (error) {
			if (isRootTransaction && transaction) {
				await transaction.rollback();
			}
			this.handleSequelizeError(error);
		}
	}

	private parseAlias(
		alias: string
	): { foreignKey: string; relatedModel: string } | null {
		const ALIAS_PREFIX = 'ALIAS';
		if (!alias.startsWith(ALIAS_PREFIX)) return null;

		const parts = alias.split(ALIAS_PREFIX).filter((p) => p);
		if (parts.length !== 2) return null;

		return {
			foreignKey: parts[0],
			relatedModel: parts[1]
		};
	}

	/**
	 * Processa associações BelongsTo, garantindo que a chave estrangeira correta seja usada
	 * independentemente do nome do alias. Usa a propriedade association.foreignKey do Sequelize
	 * que contém o nome real da coluna de chave estrangeira definida no banco de dados.
	 */
	private async processBelongsToAssociations(
		data: any,
		transaction: Transaction
	): Promise<any> {
		const processedData = { ...data };
		const belongsToAssociations = Object.values(
			this._model.associations
		).filter(
			(association: Association) => association.associationType === 'BelongsTo'
		) as BelongsTo[];
		for (const association of belongsToAssociations) {
			const aliasInfo = this.parseAlias(association.as);
			if (!aliasInfo) continue;

			const { foreignKey } = aliasInfo;
			// Usar a chave estrangeira real da associação do Sequelize
			const actualForeignKey = association.foreignKey;

			// Verificar primeiro com a chave estrangeira real, depois com a do alias
			const dataToProcess =
				processedData[actualForeignKey] || processedData[foreignKey];

			if (dataToProcess) {
				if (typeof dataToProcess !== 'object') {
					continue;
				}
				if (dataToProcess.id) {
					const foreignModel = association.target;
					const adapter = this.createAdapterForModel(foreignModel);

					const created = await adapter.update(dataToProcess, { transaction });
					processedData[actualForeignKey] = (created as any).id;
					// Limpar o campo do alias se foi usado
					if (processedData[foreignKey] && foreignKey !== actualForeignKey) {
						delete processedData[foreignKey];
					}
					continue;
				} else {
					const foreignModel = association.target;
					const adapter = this.createAdapterForModel(foreignModel);

					const created = await adapter.create(dataToProcess, { transaction });
					processedData[actualForeignKey] = (created as any).id;
					// Limpar o campo do alias se foi usado
					if (processedData[foreignKey] && foreignKey !== actualForeignKey) {
						delete processedData[foreignKey];
					}
				}
			}
		}

		return processedData;
	}

	/**
	 * Processa associações HasMany e HasOne, garantindo que a chave estrangeira correta seja usada
	 * independentemente do nome do alias ou modelo. Usa a propriedade association.foreignKey do Sequelize
	 * que contém o nome real da coluna de chave estrangeira definida no banco de dados.
	 */
	private async processHasAssociations(
		originalData: any,
		parentInstance: Model,
		transaction: Transaction
	): Promise<void> {
		const hasAssociations = Object.values(this._model.associations).filter(
			(association: Association) =>
				['HasMany', 'HasOne'].includes(association.associationType)
		) as (HasMany | HasOne)[];

		let currentAssociation: HasMany | HasOne | null = null;

		try {
			for (const association of hasAssociations) {
				currentAssociation = association;
				const aliasInfo = this.parseAlias(association.as);
				if (!aliasInfo) continue;

				const { foreignKey, relatedModel } = aliasInfo;
				const foreignKeyName = foreignKey
					? foreignKey.charAt(0).toUpperCase() + foreignKey.slice(1)
					: '';
				const relatedModelName = relatedModel
					? relatedModel.charAt(0).toUpperCase() + relatedModel.slice(1)
					: '';

				// Usar a chave estrangeira real da associação do Sequelize
				const actualForeignKey = association.foreignKey;

				const associationData =
					originalData[foreignKeyName] ||
					originalData[foreignKey] ||
					originalData[association.as];

				if (associationData) {
					const foreignModel = association.target;
					const adapter = this.createAdapterForModel(foreignModel);

					const parentId = parentInstance.get('id');
					if (
						association.associationType === 'HasMany' &&
						Array.isArray(associationData)
					) {
						for (const item of associationData) {
							if (item.id) {
								await adapter.update(
									item.id,
									{ ...item, [actualForeignKey]: parentId },
									{ transaction }
								);
								continue;
							}
							await adapter.create(
								{ ...item, [actualForeignKey]: parentId },
								{ transaction }
							);
						}
					} else if (association.associationType === 'HasOne') {
						if (associationData.id) {
							await adapter.update(
								associationData.id,
								{ ...associationData, [actualForeignKey]: parentId },
								{ transaction }
							);
							continue;
						}
						await adapter.create(
							{ ...associationData, [actualForeignKey]: parentId },
							{ transaction }
						);
					}
				}
			}
		} catch (error) {
			if (currentAssociation) {
				this.handleSequelizeWithAssociationError(error, currentAssociation);
			} else {
				this.handleSequelizeError(error);
			}
		}
	}

	private createAdapterForModel(
		model: ModelStatic<any>
	): SequelizeAdapter<any, any> {
		return new SequelizeAdapter(
			model,
			this._databaseType,
			this._databaseConnection,
			this.jsonDataToResourceFn
		);
	}

	private handleSequelizeWithAssociationError(
		error: any,
		association: Association
	): never {
		if (error.name === 'SequelizeUniqueConstraintError') {
			const aliasInfo = this.parseAlias(association.as);
			const fieldName = aliasInfo ? aliasInfo.foreignKey : association.as;
			throw new Error(
				`Campo único já cadastrado na associação '${fieldName}': ${error.errors.map((e: any) => e.path).join(', ')}`
			);
		}
		if (error.name === 'SequelizeValidationError') {
			const aliasInfo = this.parseAlias(association.as);
			const fieldName = aliasInfo ? aliasInfo.foreignKey : association.as;
			throw new InternalServerError(
				`Validation error on association '${fieldName}': ${error.errors.map((e: any) => e.message).join(', ')}`
			);
		}
		if (error.name === 'SequelizeForeignKeyConstraintError') {
			const aliasInfo = this.parseAlias(association.as);
			const fieldName = aliasInfo ? aliasInfo.foreignKey : association.as;
			throw new InternalServerError(
				`Foreign key constraint error on association '${fieldName}': ${error.message}`
			);
		}
		const aliasInfo = this.parseAlias(association.as);
		const fieldName = aliasInfo ? aliasInfo.foreignKey : association.as;
		throw new InternalServerError(`'${fieldName}': ${error.message}`);
	}

	private handleSequelizeError(error: any): never {
		if (error.name === 'SequelizeUniqueConstraintError') {
			throw new InternalServerError(
				`Campo(s) já cadastrado: ${error.errors.map((e: any) => e.path).join(', ')}`,
				{ cause: error }
			);
		}

		if (error.name === 'SequelizeValidationError') {
			throw new InternalServerError(
				`Validation error: ${error.errors.map((e: any) => e.message).join(', ')}`,
				{ cause: error }
			);
		}

		if (error.name === 'SequelizeForeignKeyConstraintError') {
			throw new InternalServerError(`Foreign key constraint error.`, {
				cause: error
			});
		}

		throw new InternalServerError('Database error.', { cause: error });
	}

	sanitizeOrderOptions(
		model: ModelStatic<any>,
		orderOptions: OrderOption[]
	): [string, OrderDirection][] {
		const allowedFields = Object.keys(model.getAttributes());

		return orderOptions
			.filter((option) => allowedFields.includes(option.field)) // só aceita colunas válidas
			.map((option) => [option.field, option.direction]);
	}

	async findAll(
		pageSize?: number,
		page?: number,
		orderOptions?: OrderOption[]
	): Promise<TClass[]> {
		try {
			let _order;

			if (!orderOptions || orderOptions.length === 0) {
				_order = this.defaultOrderOptions;
			} else {
				_order = this.sanitizeOrderOptions(this._model, orderOptions);
			}

			const items = await this._model.findAll({
				limit: pageSize,
				offset: page,
				order: _order
			});

			return this.jsonDataToResources(items);
		} catch (error) {
			throw new InternalServerError('Error to find all data using Sequelize.', {
				cause: error
			});
		}
	}

	async findOne(query: TInterface): Promise<TClass | null> {
		try {
			const item = await this._model.findOne({
				where: query as any
			});

			if (item == null) {
				return null;
			}

			return this.jsonDataToResource(item);
		} catch (error) {
			if (error instanceof NotFoundError) {
				throw error;
			}

			throw new InternalServerError('Error to find one data using Sequelize.', {
				cause: error
			});
		}
	}

	async findMany(
		query: TInterface,
		pageSize?: number,
		page?: number,
		orderOptions?: OrderOption[]
	): Promise<TInterface[]> {
		try {
			let _order;

			if (!orderOptions || orderOptions.length === 0) {
				_order = this.defaultOrderOptions;
			} else {
				_order = this.sanitizeOrderOptions(this._model, orderOptions);
			}

			const options: any = {
				where: query!,
				order: _order
			};

			if (pageSize !== undefined && page !== undefined) {
				options.limit = pageSize;
				options.offset = page;
			}

			const items = await this._model.findAll(options);

			if (!items) {
				return [];
			}

			// return this.jsonDataToResources(items);
			return items;
		} catch (error) {
			throw new InternalServerError(
				'Error to find many entities to database using Sequelize.',
				{ cause: error }
			);
		}
	}

	async findById(id: number): Promise<TClass | null> {
		try {
			const returnedValue = await this._model.findOne({
				where: { id: id }
			});

			if (returnedValue == null) {
				return null;
			}

			this.replaceForeignKeyFieldWithData(returnedValue);
			return this.jsonDataToResource(returnedValue);
		} catch (error) {
			if (error instanceof NotFoundError) {
				throw error;
			}

			throw new InternalServerError(
				'Error to find data by id using Sequelize.',
				{ cause: error }
			);
		}
	}

	async getCount(
		query?: WhereOptions,
		includeOptions?: IncludeOptions
	): Promise<number> {
		try {
			return await this._model.count({
				where: query ?? {},
				include: includeOptions
			});
		} catch (error) {
			throw new InternalServerError(
				'Error to get data count using Sequelize.',
				{ cause: error }
			);
		}
	}

	async update(
		id: number,
		data: object,
		options?: { transaction?: Transaction }
	): Promise<TClass | null> {
		let transaction = options?.transaction;
		const isRootTransaction = !transaction;

		try {
			//Verifica se é a transação raiz (a primeira transação)
			if (isRootTransaction) {
				transaction = await this._databaseConnection.transaction();
			}

			// Verifica se a transação foi criada
			if (!transaction) {
				throw new InternalServerError('Transaction not found');
			}

			// Processa associações BelongsTo primeiro
			const processedData = await this.processBelongsToAssociations(
				data,
				transaction
			);

			// Edita o registro principal
			const updatedItem = await this._model.update(processedData, {
				where: {
					id: this.databaseType == 'mongodb' ? id : Number(id)
				},
				transaction
			});

			//A opção de retornar o registro editado da função update só funciona pra msql e postgres, então na dúvida eu prefiro pesquisar novamente o registro pra não dar problemas (sei que duas buscas não é o ideial mas, o ambiente é complexo).
			const returnedValue = await this._model.findOne({ where: { id: id } });

			if (returnedValue == null) {
				return null;
			}

			// Processa associações HasMany e HasOne
			await this.processHasAssociations(data, returnedValue, transaction);

			if (isRootTransaction) {
				await transaction.commit();
			}

			return this.jsonDataToResource(returnedValue.get({ plain: true }));
		} catch (error) {
			if (error instanceof NotFoundError) {
				throw error;
			}

			throw new InternalServerError(
				'Error to update entities to database using Sequelize.',
				{ cause: error }
			);
		}
	}

	async delete(id: number): Promise<TClass | null> {
		try {
			const removedValue = this.model.findOne({
				where: { id: id }
			});

			if (removedValue == null) {
				return null;
			}

			await this.model.destroy({
				where: {
					id: id
				}
			});

			return this.jsonDataToResource(removedValue);
		} catch (error) {
			if (error instanceof NotFoundError) {
				throw error;
			}

			throw new InternalServerError('Error delete data using Sequelize.', {
				cause: error
			});
		}
	}

	async deleteMany(query: TInterface): Promise<TClass[]> {
		try {
			//Essa busca é feita para retornar o objeto que será removido
			const removedValueList = await this._model.findAll({ where: query! });

			await this._model.destroy({
				where: query!
			});

			return this.jsonDataToResources(removedValueList);
		} catch (error) {
			if (error instanceof NotFoundError) {
				throw error;
			}

			throw new InternalServerError('Error delete many data using Sequelize.', {
				cause: error
			});
		}
	}

	async deleteAll(): Promise<void> {
		try {
			await this._model.truncate();
		} catch (error) {
			throw new InternalServerError(
				'Error to delete all data using Sequelize.',
				{ cause: error }
			);
		}
	}

	async executeQuery(
		query: string,
		replacements?: Record<string, any>,
		transaction?: Transaction
	): Promise<object> {
		try {
			const [results, metadata] = await this.databaseConnection.query(query, {
				replacements: replacements,
				transaction: transaction || null
			});

			return Object(results);
		} catch (error) {
			throw new InternalServerError('Error to execute query.', {
				cause: error
			});
		}
	}

	buildCustomQuery(
		filterValues: FilterValue[],
		filterConditions: string[],
		databaseModels?: Map<string, any>,
		targetModelName?: string
	): any {
		try {
			const newQuery = buildCustomQuery(
				filterValues,
				filterConditions,
				databaseModels,
				targetModelName
			);
			return newQuery;
		} catch (error) {
			throw error;
		}
	}

	protected jsonDataToResources(jsonData: any[]): TClass[] {
		let formattedResults;
		try {
			formattedResults = jsonData.map((record) => record.get({ plain: true })); //onverte o objeto Sequelize em um objeto plano (plain object) que inclui os dataValues do registro principal e das entidades associadas.
		} catch (error) {
			formattedResults = jsonData;
		}

		const resources: TClass[] = [];
		formattedResults.forEach((element) =>
			resources.push(this.jsonDataToResourceFn(element))
		);
		return resources;
	}

	protected jsonDataToResource(jsonData: any): TClass {
		return this.jsonDataToResourceFn(jsonData);
	}

	/**
	 * Percorre os campos retornados das associações da entidade para substituir os campos que só ficam as chaves estrangeiras
	 * @param item
	 */
	private replaceForeignKeyFieldWithData(item: any) {
		const ifRegex = /^ALIAS.*ALIAS/;
		const getRegex = /ALIAS(.*?)ALIAS/;
		const manyRegex = /^(ALIAS)(.*?)ALIAS.*ALIAS$/;
		for (const key in item) {
			if (ifRegex.test(key)) {
				const alias = key.match(getRegex);
				const manyAlias = key.match(manyRegex);

				//Se for uma associação de muitos para um
				if (manyAlias?.[2]) {
					item[manyAlias?.[2]] = item[key];
					continue;
				}

				//Se for uma associação de um para um
				for (const key2 in item.dataValues) {
					if (alias?.[1] === key2) {
						item.dataValues[key2] = item[key];
					}
				}
			}
		}
	}

	/**
	 * Percorre os campos retornados das associações da entidade para substituir os campos que só ficam as chaves estrangeiras de varias entidades
	 * @param variableName
	 * @returns
	 */
	private replaceForeignKeysFieldWithData(items: any[]) {
		const ifRegex = /^ALIAS.*ALIAS/;
		const getRegex = /ALIAS(.*?)ALIAS/;
		const manyRegex = /^(ALIAS)(.*?)ALIAS.*ALIAS$/;
		for (const item of items) {
			for (const key in item) {
				if (ifRegex.test(key)) {
					const alias = key.match(getRegex);
					const manyAlias = key.match(manyRegex);

					//Se for uma associação de muitos para um
					if (manyAlias?.[2]) {
						item.dataValues[manyAlias?.[2]] = item[key];
						continue;
					}

					//Se for uma associação de um para um
					for (const key2 in item.dataValues) {
						if (alias?.[1] === key2) {
							item.dataValues[key2] = item[key];
						}
					}
				}
			}
		}
	}

	async startTransaction(): Promise<any> {
		try {
			return await this.databaseConnection.transaction();
		} catch (error) {
			throw new InternalServerError(
				'Error to start transaction using Sequelize.',
				{ cause: error }
			);
		}
	}

	async commitTransaction(transaction: Transaction): Promise<any> {
		try {
			return await transaction.commit();
		} catch (error) {
			throw new InternalServerError(
				'Error to commit transaction using Sequelize.',
				{ cause: error }
			);
		}
	}

	async rollbackTransaction(transaction: Transaction): Promise<void> {
		try {
			await transaction.rollback();
		} catch (error) {
			throw new InternalServerError(
				'Error to rollback transaction using Sequelize.',
				{ cause: error }
			);
		}
	}

	async createWithTransaction(
		data: TInterface,
		transaction: Transaction
	): Promise<TClass> {
		try {
			const newItem = await this._model.create(data!, {
				transaction: transaction
			});

			if (typeof data === 'object' && data !== null && 'id' in data) {
				await this.resincronizeSequence(
					'public',
					this._model.tableName,
					transaction
				);
			}

			return this.jsonDataToResource(newItem);
		} catch (error: any) {
			console.log(error);
			// await this.rollbackTransaction(transaction);
			// Manipula erros específicos
			if (error.name === 'SequelizeUniqueConstraintError') {
				throw new InternalServerError(
					'Error to save data usign sequelize. One data is unique.',
					{ cause: error }
				);
			}

			if (error.name === 'SequelizeValidationError') {
				// Para erros de validação, você pode retornar detalhes específicos
				throw new InternalServerError(
					'Validation Error on save data using Sequelize.',
					{ cause: error }
				);
			}

			throw new InternalServerError(
				'Error to save data with transaction using Sequelize.',
				{ cause: error }
			);
		}
	}

	async updateWithTransaction(
		id: number,
		data: object,
		transaction: Transaction
	): Promise<TClass> {
		try {
			//Irá obter a quantidade de linhas alteradas
			const [affectedCount] = await this._model.update(data, {
				where: {
					id: this.databaseType == 'mongodb' ? id : Number(id)
				},
				transaction: transaction
			});

			//Se nenhum registro foi atualizado
			if (affectedCount == 0) {
				throw new NotFoundError('NOT_FOUND');
			}

			//A opção de retornar o registro editado da função update só funciona pra msql e postgres, então na dúvida eu prefiro pesquisar novamente o registro pra não dar problemas (sei que duas buscas não é o ideial mas, o ambiente é complexo).
			const returnedValue = await this._model.findOne({
				where: { id: id },
				transaction: transaction
			});

			return this.jsonDataToResource(returnedValue);
		} catch (error) {
			await this.rollbackTransaction(transaction);

			if (error instanceof NotFoundError) {
				throw error;
			}

			throw new InternalServerError(
				'Error to update entities to database with transaction using Sequelize.',
				{ cause: error }
			);
		}
	}

	async deleteWithTransaction(
		id: number,
		transaction: Transaction
	): Promise<TClass> {
		try {
			//Essa busca é feita para retornar o objeto que será removido
			const removedValue = await this._model.findOne({
				where: { id: id },
				transaction: transaction
			});

			await this._model.destroy({
				where: {
					id: id
				},
				transaction: transaction
			});

			return this.jsonDataToResource(removedValue);
		} catch (error) {
			await this.rollbackTransaction(transaction);
			if (error instanceof NotFoundError) {
				throw error;
			}

			throw new InternalServerError(
				'Error delete data with transaction using Sequelize.',
				{ cause: error }
			);
		}
	}

	async deleteManyWithTransaction(
		query: TInterface,
		transaction: Transaction
	): Promise<TClass[]> {
		try {
			//Essa busca é feita para retornar o objeto que será removido
			const removedValueList = await this._model.findAll({
				where: query!,
				transaction: transaction
			});

			await this._model.destroy({
				where: query!,
				transaction: transaction
			});

			return this.jsonDataToResources(removedValueList);
		} catch (error) {
			await this.rollbackTransaction(transaction);

			if (error instanceof NotFoundError) {
				throw error;
			}

			throw new InternalServerError(
				'Error delete many data with transaction using Sequelize.',
				{ cause: error }
			);
		}
	}

	async findAllWithEagerLoading(
		pageSize: number,
		page: number,
		orderOptions?: OrderOption[],
		associatedItemsLimit: number = 10
	): Promise<TClass[]> {
		try {
			let _order;

			if (!orderOptions || orderOptions.length === 0) {
				_order = this.defaultOrderOptions;
			} else {
				_order = this.sanitizeOrderOptions(this._model, orderOptions);
			}

			const items = await this._model.findAll({
				limit: pageSize,
				offset: page,
				order: _order
			});

			return this.getAssociatedItems(items, associatedItemsLimit);
		} catch (error) {
			throw new InternalServerError(
				'Error to find all data with eager loading using Sequelize.',
				{ cause: error }
			);
		}
	}

	async findOneWithEagerLoading(
		query: TInterface,
		associatedItemsLimit: number = 10
	): Promise<TClass> {
		try {
			const item = await this._model.findOne({
				where: query as any
			});

			if (item == null) {
				throw new NotFoundError('NOT_FOUND');
			}

			const data = await this.getAssociatedItems([item], associatedItemsLimit);
			return data[0];
		} catch (error) {
			if (error instanceof NotFoundError) {
				throw error;
			}

			throw new InternalServerError(
				'Error to find one data with eager loading function using Sequelize.',
				{ cause: error }
			);
		}
	}

	/**
	 * Função responsável por percorrer cada campo da entidade e caso encontre um campo que é de relacionamento com outra entidade, é buscado os dados associados.
	 * @example Entidade Cliente tem vários Veículo, é percorrido na tabela da entidade Veículo os registros de veículos associados ao cliente e retornado junto com o cliente.
	 * @param items lista de itens
	 * @param associatedItemsLimit Quantidade de itens dos filhos que irá buscar. Exemplo: Usuário tem relação com veículos, vai buscar no máximo 5 veiculos do usuário
	 * @returns
	 */
	async getAssociatedItems(
		items: any[],
		associatedItemsLimit: number
	): Promise<TClass[]> {
		try {
			// Obtenha os IDs dos registros encontrados
			const itemIds = items.map((item) => item.id);

			// Obtenha todas as associações do modelo
			const associations = Object.entries(this._model.associations);

			// Para cada associação definida no modelo
			for (const [associationName, association] of associations) {
				const associateModel = association.target;

				// Determine a chave estrangeira correta com base no tipo de associação
				let whereCondition = {};

				if (association.associationType === 'BelongsTo') {
					// Se for BelongsTo, a chave estrangeira está no modelo principal
					// Colete os valores da chave estrangeira dos itens principais
					const foreignKeyValues = items
						.map((item) => item[association.foreignKey])
						.filter(Boolean);
					if (foreignKeyValues.length === 0) continue;
					whereCondition = { id: foreignKeyValues };
				} else {
					// Para HasMany, HasOne, BelongsToMany, a chave estrangeira está no modelo associado
					whereCondition = { [association.foreignKey]: itemIds };
				}

				// Busque os registros associados
				let associatedItems;
				try {
					associatedItems = await associateModel.findAll({
						where: whereCondition,
						limit: associatedItemsLimit
					});
				} catch (error) {
					throw new InternalServerError(
						'Erro to get items with where custom condition.',
						{ cause: error }
					);
				}

				// Associe manualmente os itens associados aos itens principais
				items.forEach((item) => {
					if (association.associationType === 'BelongsTo') {
						// Para BelongsTo, encontre o item associado pelo ID
						const associatedItem = associatedItems.find(
							(assoc: any) => assoc.id === item[association.foreignKey]
						);
						item[associationName] = associatedItem || null;
					} else {
						// Para HasMany, HasOne, BelongsToMany, filtre os itens associados pela chave estrangeira
						const relatedItems = associatedItems.filter(
							(assoc: any) => assoc[association.foreignKey] === item.id
						);
						item[associationName] =
							association.associationType === 'HasOne'
								? relatedItems[0] || null
								: relatedItems;
					}
				});
			}

			this.replaceForeignKeysFieldWithData(items);

			return this.jsonDataToResources(items);
		} catch (error) {
			throw new InternalServerError(
				'Error to get associated items using Sequelize.',
				{ cause: error }
			);
		}
	}

	async findManyWithEagerLoading(
		pageSize: number,
		page: number,
		associatedItemsLimit: number = 10,
		query?: WhereOptions,
		includeOptions?: IncludeOptions,
		orderOptions?: OrderOption[]
	): Promise<TClass[]> {
		try {
			let _order;
			// Se não vier nada ou vier array vazio -> default
			if (!orderOptions || orderOptions.length === 0) {
				_order = this.defaultOrderOptions;
			} else {
				_order = this.sanitizeOrderOptions(this._model, orderOptions);
			}

			const items = await this._model.findAll({
				where: query || {},
				include: includeOptions,
				limit: pageSize,
				offset: page,
				order: _order
			});

			if (items == null) {
				return [];
			}

			return await this.getAssociatedItems(items, associatedItemsLimit);
		} catch (error) {
			if (error instanceof NotFoundError) {
				throw error;
			}
			console.log(error);
			throw new InternalServerError(
				'Error to find many data with eager loading using Sequelize.',
				{ cause: error }
			);
		}
	}

	async findByIdWithEagerLoading(
		id: number,
		associatedItemsLimit: number = 10
	): Promise<TClass | null> {
		try {
			const items = await this._model.findOne({
				where: { id: id }
			});

			if (items == null) {
				return null;
			}

			const data = await this.getAssociatedItems([items], associatedItemsLimit);
			return data[0];
		} catch (error) {
			if (error instanceof NotFoundError) {
				throw error;
			}

			throw new InternalServerError(
				'Error to find data by id with eager loading using Sequelize.',
				{ cause: error }
			);
		}
	}

	/**
	 * Resincroniza a Sequence após criar um registro no banco de dados que contém um ID definido. Importante para permitir que seja possível registrar outros dados na tabela com o id sendo incremental.
	 * @param schemaName Nome do schema
	 * @param tableName Nome da tabela
	 * @param lastId Ultimo identificador registrado
	 * @param transaction Deverá ser chamado durante uma transação. Após feito a operação.
	 */
	async resincronizeSequence(
		schemaName: string,
		tableName: string,
		transaction: Transaction
	): Promise<object> {
		try {
			return await this.executeQuery(
				`
        SELECT setval(
          pg_get_serial_sequence(:pathName, 'id'),
          GREATEST((SELECT COALESCE(MAX(id), 1) FROM ${schemaName + '.' + tableName}), 1)
        );
        `,
				{
					pathName: schemaName + '.' + tableName
				},
				transaction
			);
		} catch (error) {
			throw new InternalServerError('Erro on Resincronize Sequence.', {
				cause: error
			});
		}
	}
}
