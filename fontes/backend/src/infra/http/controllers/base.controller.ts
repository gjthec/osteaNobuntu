import { NextFunction, Request, Response } from 'express';
import { IBaseController } from './IBase.controller';
import { NotFoundError, ValidationError } from '../../../errors/client.error';
import { IBaseRepository } from '../../../domain/repositories/ibase.repository';
import { CsvDataExporter } from '../../exporters/csvData.exporter';
import { XlsxDataExporter } from '../../exporters/xlsxData.exporter';
import { OrderDirection, OrderOption } from '../../database/IDatabase.adapter';
import { InternalServerError } from '../../../errors/internal.error';
import FilterSearchParameterRepository from '../../../domain/repositories/filterSearchParameter.repository';
import { AuthenticatedRequest } from '../middlewares/checkUserAccess.middleware';
import { TenantConnection } from '../../../domain/entities/tenantConnection.model';
import { FilterValue } from '../../database/iFilterValue';
import { isSnakeCase, toSnakeCase } from '../../../utils/string.util';

export interface PaginatedResponse<TClass> {
	items: TClass[];
	total: number;
	page: number;
	pageSize: number;
}

export class BaseController<TInterface, TClass> implements IBaseController {
	private repository: IBaseRepository<TInterface, TClass>;
	public entityName: string;

	constructor(
		repository: IBaseRepository<TInterface, TClass>,
		entityName: string
	) {
		this.repository = repository;
		this.entityName = entityName;
	}

	/**
	 * Realiza a criação e salvamento no banco de dados de uma nova entidade
	 * @param req Dados da requisição
	 * @param res Resposta da requisição
	 * @returns Retorna um Object ou null
	 */
	public async create(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			const result = await this.repository.create(req.body);
			return res.status(201).json(result);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Obtem todos os registros da entidade
	 * @param req Dados da requisição
	 * @param res Resposta da requisição
	 * @returns Retorna um Object ou null
	 */
	async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			//Obtem a página
			const page: number = parseInt(req.query.page as string) || 1;
			//Obtem a quantidade limite de itens por página
			const pageSize: number = parseInt(req.query.pageSize as string) || 100;
			//Obtem as opções de ordenação
			const orderOptions: OrderOption[] = this.parseSortParam(
				req.query.sort as string
			);

			const startIndex = (page - 1) * pageSize;

			// Separa os filtros da paginação
			const { page: _, pageSize: __, sort: ___, ...filters } = req.query;

			const hasFilters = Object.keys(filters).length > 0;

			let data = null;
			let count = 0;

			if (hasFilters) {
				data = await this.repository.findManyWithEagerLoading(
					pageSize,
					startIndex,
					10,
					filters as TInterface,
					orderOptions
				);
				count = await this.repository.getCount(filters);
			} else {
				data = await this.repository.findAllWithEagerLoading(
					pageSize,
					startIndex,
					orderOptions,
					10
				);
				count = await this.repository.getCount();
			}

			const formattedData: PaginatedResponse<TClass> = {
				items: data,
				page: page,
				pageSize: pageSize,
				total: count
			};

			return res.status(200).send(formattedData);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Retorna um registro da entidade
	 * @param req Dados da requisição
	 * @param res Resposta da requisição
	 * @returns Retorna um Object ou null
	 */
	async findOne(req: Request, res: Response, next: NextFunction) {
		try {
			const data = await this.repository.findOne(req.body);
			if (!data) {
				return res.status(404).send({
					message: 'A entidade com id ' + req.params.id + ' não foi encontrada!'
				});
			}

			return res.status(200).send(data);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Obtem um registro da entidade que tenha o Identificador igual
	 * @param req Dados da requisição
	 * @param res Resposta da requisição
	 * @returns Retorna um Object ou null
	 */
	async findById(req: Request, res: Response, next: NextFunction) {
		try {
			const id: number = Number(req.params.id);
			const data = await this.repository.findById(id);
			if (!data) {
				return res.status(404).send({
					message: 'A entidade com id ' + req.params.id + ' não foi encontrada!'
				});
			}

			return res.status(200).send(data);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Obtem um registro da entidade e o dados associados que tenha o Identificador igual
	 * @param req Dados da requisição
	 * @param res Resposta da requisição
	 * @returns Retorna um Object ou null
	 */
	async findByIdWithEagerLoading(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		try {
			const id: number = Number(req.params.id);
			const data = await this.repository.findByIdWithEagerLoading(id, 10);
			if (!data) {
				return res.status(404).send({
					message: 'A entidade com id ' + req.params.id + ' não foi encontrada!'
				});
			}

			return res.status(200).send(data);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Obtem um registro da entidade e o dados associados que tenha o Identificador igual
	 * @param req Dados da requisição
	 * @param res Resposta da requisição
	 * @returns Retorna um Object ou null
	 */
	async findManyWithEagerLoading(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			//Obtem a página
			const page: number = parseInt(req.query.page as string) || 1;
			//Obtem a quantidade limite de itens por página
			const pageSize: number = parseInt(req.query.pageSize as string) || 100;
			//Obtem as opções de ordenação
			const orderOptions: OrderOption[] = this.parseSortParam(
				req.query.sort as string
			);

			const { ...filters } = req.body;
			const filterValues = req.body.filterValues;
			const filterConditions = req.body.conditions;
			const startIndex = (page - 1) * pageSize;
			
			if (!req.tenantConnection) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}
			
			const modelName: string =
			this.entityName[0].toUpperCase() + this.entityName.slice(1);

			let whereOptions = filters;
			let includeOptions;

			// Prepara as opções apenas se houver filtro
			if (filterValues) {
				const query = await this.repository.buildCustomQuery(
					filterValues,
					filterConditions,
					req.tenantConnection.models!,
					modelName
				);
				whereOptions = query.whereOptions;
				includeOptions = query.includeOptions;
			}

			// Uma única chamada para buscar os dados
			const data = await this.repository.findManyWithEagerLoading(
				pageSize,
				startIndex,
				10,
				whereOptions,   
				includeOptions, 
				orderOptions
			);

			const count = (whereOptions || includeOptions) 
				? await this.repository.getCount(whereOptions, includeOptions)
				: await this.repository.getCount();

			const formattedData: PaginatedResponse<TClass> = {
				items: data,
				page: page,
				pageSize: pageSize,
				total: count
			};

			if (!formattedData) {
				throw new NotFoundError('NOT_FOUND');
			}

			return res.status(200).send(formattedData);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Obtem a quantidade de registros da entidade
	 * @param req Dados da requisição
	 * @param res Resposta da requisição
	 * @returns Retorna um Object ou null
	 */
	async getCount(req: Request, res: Response, next: NextFunction) {
		try {
			const data = await this.repository.getCount();
			return res.status(200).send({ count: data!.toString() });
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Atualiza dados de uma registro da entidade
	 * @param req Dados da requisição
	 * @param res Resposta da requisição
	 * @returns Retorna um Object ou null
	 */
	async update(req: Request, res: Response, next: NextFunction) {
		try {
			const id: number = Number(req.params.id);
			const newValues = req.body;

			const data = await this.repository.update(id, newValues);
			if (!data) {
				throw new NotFoundError('NOT_FOUND');
			}

			return res.status(200).send({
				message:
					'The entity ' +
					this.entityName +
					' with id: ' +
					id +
					' updated successfully.'
			});
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Remove um registro da entidade
	 * @param req Dados da requisição
	 * @param res Resposta da requisição
	 * @returns Retorna um Object ou null
	 */
	async delete(req: Request, res: Response, next: NextFunction) {
		try {
			const id: number = Number(req.params.id);

			if (!id) {
				throw new ValidationError('FIELD_REQUIRED', {
					cause: 'Id is required.'
				});
			}

			const data = await this.repository.delete(id);

			if (!data) {
				throw new NotFoundError('NOT_FOUND');
			}

			return res.status(200).send({
				message: 'The entity ' + this.entityName + ' deleted successfully.'
			});
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Remove todas os registros da entidade
	 * @param req Dados da requisição
	 * @param res Resposta da requisição
	 * @returns Retorna um Object ou null
	 */
	async deleteAll(req: Request, res: Response, next: NextFunction) {
		try {
			const data = await this.repository.deleteAll();
			return res.status(200).send({
				message: 'All entities ' + this.entityName + ' deleted successfully.'
			});
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Obtem valores com base em dados de uma busca com uso de filtro
	 * @param req Dados da requisição
	 * @param res Resposta da requisição
	 * @returns Retorna um Object ou null
	 */
	async findCustom(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			//Obtem a página
			const page: number = parseInt(req.query.page as string) || 1;
			//Obtem a quantidade limite de itens por página
			const pageSize: number = parseInt(req.query.pageSize as string) || 100;
			//Obtem as opções de ordenação
			const orderOptions: OrderOption[] = this.parseSortParam(
				req.query.sort as string
			);

			const startIndex = (page - 1) * pageSize;

			const filterValues = req.body.parameters.filterValues;
			const filterConditions = req.body.parameters.conditions;

			const modelName: string =
				this.entityName[0].toUpperCase() + this.entityName.slice(1);

			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			const model = req.tenantConnection.models?.get(modelName);

			if (!model) {
				throw new InternalServerError('Error on find custom.');
			}
			const query = await this.repository.buildCustomQuery(
				filterValues,
				filterConditions,
				req.tenantConnection.models!,
				modelName
			);
			console.log(query)
			const data = await this.repository.findManyWithEagerLoading(
				pageSize,
				startIndex,
				5,
				query.whereOptions,
				query.includeOptions,
				orderOptions
			);
			const count = await this.repository.getCount(
				query.whereOptions,
				query.includeOptions
			);

			if (!data) {
				throw new NotFoundError('NOT_FOUND');
			}

			const formattedData: PaginatedResponse<TClass> = {
				items: data,
				page: page,
				pageSize: pageSize,
				total: count
			};

			return res.status(200).send(formattedData);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Obtem valores com base em dados de uma busca com uso de filtro que já está registrado no banco de dados
	 * @param req Dados da requisição
	 * @param res Resposta da requisição
	 * @returns Retorna um Object ou null
	 */
	async findUsingRegisteredCustomQuery(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction,
		tenantConnection: TenantConnection
	) {
		try {
			if (!req.user) {
				throw new NotFoundError('USER_NOT_FOUND');
			}

			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			//Obtem a página
			const page: number = parseInt(req.query.page as string) || 1;
			//Obtem a quantidade limite de itens por página
			const pageSize: number = parseInt(req.query.pageSize as string) || 100;
			//Obtem as opções de ordenação
			const orderOptions: OrderOption[] = this.parseSortParam(
				req.query.sort as string
			);

			const startIndex = (page - 1) * pageSize;

			const filterSearchParameterId: number = Number(
				req.query.filterSearchParameterId
			);

			const filterSearchParameterRepository: FilterSearchParameterRepository =
				new FilterSearchParameterRepository(tenantConnection);
			//Verificar se usuário tem acesso ao filtro
			await filterSearchParameterRepository.advancedSearches.checkUserAccess(
				filterSearchParameterId,
				['owner', 'read'],
				['owner', 'read'],
				req.user.identityProviderUID
			);
			const filterSearchParameter =
				await filterSearchParameterRepository.findById(filterSearchParameterId);

			if (!filterSearchParameter) {
				throw new NotFoundError('NOT_FOUND', {
					cause: 'Not found filter search parameter.'
				});
			}

			const params = filterSearchParameter.parameters as {
				conditions?: string[];
				filterValues?: FilterValue[];
			};

			const filterValues = params.filterValues;
			const filterConditions = params.conditions!;
			let filterSearchParameterModelName: string =
				filterSearchParameter.className!;

			const modelName: string =
				this.entityName[0].toUpperCase() + this.entityName.slice(1);
			const model = req.tenantConnection.models?.get(modelName);

			if (!model) {
				throw new InternalServerError('Error on find custom.');
			}

			//Se o nome do model for snake case
			if (isSnakeCase(modelName) == true) {
				//Converte o outro para snake case
				filterSearchParameterModelName = toSnakeCase(
					filterSearchParameterModelName
				);
			}

			// Realiza a comparação para saber se a entidade dos parâmetros de filtragem é para essa rota
			if (filterSearchParameterModelName !== modelName) {
				throw new ValidationError('FIELD_REQUIRED', {
					cause: 'Selected search parameter filter not valid.'
				});
			}

			const query = await this.repository.buildCustomQuery(
				filterValues!,
				filterConditions,
				req.tenantConnection.models!,
				filterSearchParameterModelName
			);
			const data = await this.repository.findManyWithEagerLoading(
				pageSize,
				startIndex,
				5,
				query.whereOptions,
				query.includeOptions,
				orderOptions
			);
			const count = await this.repository.getCount(
				query.whereOptions,
				query.includeOptions
			);

			if (!data) {
				throw new NotFoundError('NOT_FOUND');
			}

			const formattedData: PaginatedResponse<TClass> = {
				items: data,
				page: page,
				pageSize: pageSize,
				total: count
			};

			return res.status(200).send(formattedData);
		} catch (error) {
			next(error);
		}
	}

	async executeQuery(req: Request, res: Response, next: NextFunction) {
		try {
			const data = await this.repository.executeQuery(req.body.query);
			if (!data) {
				throw new NotFoundError('NOT_FOUND', {
					cause: 'Not found entity to search.'
				});
			}

			return res.status(200).send(data);
		} catch (error) {
			next(error);
		}
	}

	async exportDocuments(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			const filterValues = req.body.filterValues;
			const filterConditions = req.body.conditions;
			const documentFormat = req.params.documentFormat || 'csv';

			if (!['csv', 'xlsx'].includes(documentFormat)) {
				//TODO arrumar erro de retorno
				return res.status(400).send({
					message: "Formato de documento inválido. Use 'csv' ou 'xlsx'"
				});
			}

			const modelName: string =
				this.entityName[0].toUpperCase() + this.entityName.slice(1);
	
			if (!req.tenantConnection) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			const model = req.tenantConnection.models?.get(modelName);
			if (!model) {
				return (
					res
						.status(404)
						//TODO arrumar erro de retorno
						.send({ message: `Modelo ${this.entityName} não encontrado.` })
				);
			}

			const query = await this.repository.buildCustomQuery(
				filterValues,
				filterConditions,
				req.tenantConnection.models!,
				modelName
			);

			//Se quiser mudar o tamanho máximo de registros, alterar aqui
			const data = await this.repository.findManyWithEagerLoading(
				100000,
				0,
				10,
				query.whereOptions,
				query.includeOptions
			);

			const mappings = data[0]
				? Object.keys(data[0] as object).map((key) => ({
						modelField: key,
						csvField: key
					}))
				: [];

			let dataStream: any;

			// Configurar headers de resposta baseado no formato
			switch (documentFormat) {
				case 'csv': {
					res.setHeader(
						'Content-Disposition',
						`attachment; filename=${this.entityName}_export.csv`
					);
					res.setHeader('Content-Type', 'text/csv');
					const csvExporter = new CsvDataExporter();
					dataStream = await csvExporter.export(data, mappings);
					break;
				}
				case 'xlsx': {
					res.setHeader(
						'Content-Disposition',
						`attachment; filename=${this.entityName}_export.xlsx`
					);
					res.setHeader(
						'Content-Type',
						'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
					);
					const xlsxExporter = new XlsxDataExporter();
					dataStream = await xlsxExporter.export(data, mappings);
					break;
				}
				default:
					//TODO arrumar erro de retorno
					return res.status(400).send({
						message: "Formato de documento inválido. Use 'csv' ou 'xlsx'."
					});
			}

			dataStream.pipe(res);

			// Tratar erros do stream
			dataStream.on('error', (error: any) => {
				console.error('Erro no stream de exportação de documentos:', error);
				if (!res.headersSent) {
					res.status(500).json({ error: 'Erro ao gerar o documento' });
				}
			});

			// Comportamentos ao momento que a stream finalizar
			dataStream.on('end', () => {
				console.log('Documento exportado com sucesso');
			});
		} catch (error) {
			console.log(error)
			next(error);
		}
	}
	/**
	 * Obtem os parâmetros de ordenação para buscas
	 * @param sortParam
	 */
	parseSortParam(sortParam?: string): OrderOption[] {
		if (!sortParam) return [];

		return sortParam.split(',').map((part) => {
			const [field, dir] = part.split(':');

			return {
				field: field.trim(),
				direction: (dir?.toUpperCase() === 'DESC'
					? 'DESC'
					: 'ASC') as OrderDirection
			};
		});
	}
}
