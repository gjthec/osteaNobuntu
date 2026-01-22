import { FilterValue } from './iFilterValue';
//TODO essas dependências de pacotes devem ser removidos daqui
import { ClientSession, Connection } from 'mongoose';
import {
	IncludeOptions,
	Sequelize,
	Transaction,
	WhereOptions
} from 'sequelize';

/**
 * Tipos de direção permitidos na ordenação
 */
export type OrderDirection = 'ASC' | 'DESC';

/**
 * Critério de ordenação nas operações do bando de dados
 */
export interface OrderOption {
	field: string;
	direction: OrderDirection;
}

//Interface com as funcionalidades dos bancos de dados
export interface IDatabaseAdapter<TInterface, TClass> {
	readonly model: any;
	readonly databaseType: string;
	readonly databaseConnection: Connection | Sequelize;

	//Lazy loading
	create(data: TInterface): Promise<TClass>;
	findAll(
		pageSize: number,
		page: number,
		orderOptions?: OrderOption[]
	): Promise<TClass[]>;
	findOne(query: TInterface): Promise<TClass | null>;
	findMany(
		query: TInterface,
		pageSize?: number,
		page?: number,
		orderOptions?: OrderOption[]
	): Promise<TInterface[]>;
	findById(id: number): Promise<TClass | null>;
	getCount(query?: any, includeOptions?: IncludeOptions): Promise<number>;
	update(id: number, data: Object): Promise<TClass | null>;
	delete(id: number): Promise<TClass | null>;
	deleteMany(query: TInterface): Promise<TClass[]>;
	deleteAll(): Promise<void>;
	executeQuery(
		query: string,
		replacements?: Record<string, any>
	): Promise<Object>;
	buildCustomQuery(
		filterValues: FilterValue[],
		filterConditions: string[],
		databaseModels?: Map<string, any>,
		targetModelName?: string
	): any;

	/**
	 * Sanitização do input. Para não permitir usuário de inserir campos que não tem na classe ou qualquer outra coisa estranha.
	 * @param orderOptions Critério de ordenação nas operações do bando de dados
	 */
	sanitizeOrderOptions(
		model: any,
		orderOptions: OrderOption[]
	): [string, OrderDirection][];

	//Transações
	startTransaction(): Promise<any>; //irá chamar a instância do banco de dados para operar as transações com query pura no repository
	commitTransaction(transaction: ClientSession | Transaction): Promise<void>;
	rollbackTransaction(transaction: ClientSession | Transaction): Promise<void>;

	createWithTransaction(
		data: TInterface,
		transaction: ClientSession | Transaction
	): Promise<TClass>;
	updateWithTransaction(
		id: number,
		data: Object,
		transaction: ClientSession | Transaction
	): Promise<TClass>;
	deleteWithTransaction(
		id: number,
		transaction: ClientSession | Transaction
	): Promise<TClass>;
	/**
	 * Faz a remoção de vários registros de uma vez com uso de transação para manter a atomicidade da operação. Os registros removidos são com base nos dados da query.
	 * @param query Dados que irão descrever quais registros serão removidos
	 * @param transaction Instancia da transação
	 * @returns Retorna uma lista com todos os registros que foram eliminados do banco de dados
	 */
	deleteManyWithTransaction(
		query: TInterface,
		transaction: ClientSession | Transaction
	): Promise<TClass[]>;
	/**
	 * Obtem todos os registros da entidade, retornando também dados dos registros associados
	 * @param associatedItemsLimit Quantidade de itens dos filhos que irá buscar em cada registro. Exemplo: Cada usuário tem relação com veículos, vai buscar no máximo 5 veiculos de cada usuário.
	 */
	findAllWithEagerLoading(
		pageSize: number,
		page: number,
		orderOptions?: OrderOption[],
		associatedItemsLimit?: number
	): Promise<TClass[]>; //funções que já buscam com tudo (sequelize é include, mongoose nem lembro)
	/**
	 * Obtem um único registro, retornando também dados dos registros associados
	 * @param associatedItemsLimit Quantidade de itens dos filhos que irá buscar em cada registro. Exemplo: Cada usuário tem relação com veículos, vai buscar no máximo 5 veiculos de cada usuário.
	 */
	findOneWithEagerLoading(
		query: TInterface,
		associatedItemsLimit?: number
	): Promise<TClass | null>;
	/**
	 * Obtem vários registros do banco de dados retornando também dados dos registros associados
	 * @param associatedItemsLimit Quantidade de itens dos filhos que irá buscar em cada registro. Exemplo: Cada usuário tem relação com veículos, vai buscar no máximo 5 veiculos de cada usuário.
	 */
	findManyWithEagerLoading(
		pageSize: number,
		page: number,
		associatedItemsLimit?: number,
		query?: TInterface | WhereOptions,
		includeOptions?: IncludeOptions | any,
		orderOptions?: OrderOption[]
	): Promise<TClass[]>;
	/**
	 * Obtem um único registro com base no identificador, retornando também dados dos registros associados
	 * @param associatedItemsLimit Quantidade de itens dos filhos que irá buscar em cada registro. Exemplo: Cada usuário tem relação com veículos, vai buscar no máximo 5 veiculos de cada usuário.
	 */
	findByIdWithEagerLoading(
		id: number,
		associatedItemsLimit?: number
	): Promise<TClass | null>;
	/**
	 * Faz a sincronização da variável do banco de dados que é utilizada para criação do Id de cada registro. Ao ser registrado algo com Id já definido o ID pode ficar desincronizado.
	 * @param schemaName Nome do schema
	 * @param tableName Nome da tabela
	 * @param transaction Transação na qual foi feito a operação de criação
	 */
	resincronizeSequence(
		schemaName: string,
		tableName: string,
		transaction: Transaction
	): Promise<object>;
}