import { FilterValue } from '../../infra/database/iFilterValue';
import { OrderOption } from '../../infra/database/IDatabase.adapter';

export interface IBaseRepository<TInterface, TClass> {
	create(data: TInterface): Promise<TClass>;
	findAll(
		pageSize: number,
		page: number,
		orderOptions?: OrderOption[]
	): Promise<TClass[]>;
	findOne(query: TInterface): Promise<TClass | null>;
	findMany(
		query: TInterface,
		pageSize: number,
		page: number,
		orderOptions?: OrderOption[]
	): Promise<TInterface[]>;
	findById(id: number): Promise<TClass | null>;
	getCount(query?: any, includeOptions?: any): Promise<number>;
	update(id: number, data: Object): Promise<TClass | null>;
	delete(id: number): Promise<TClass | null>;
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
	): Promise<any>;

	//Transações
	startTransaction(): Promise<any>; //irá chamar a instância do banco de dados para operar as transações com query pura no repository
	commitTransaction(transaction: unknown): Promise<void>;
	rollbackTransaction(transaction: unknown): Promise<void>;
	//Caso o banco de dados ou biblioteca não tenha os métodos acima pra implementar, no UseCase tratar de reverter no "catch"

	createWithTransaction(
		data: TInterface,
		transaction: unknown
	): Promise<TClass>;
	updateWithTransaction(
		id: number,
		data: Object,
		transaction: unknown
	): Promise<TClass>;
	deleteWithTransaction(id: number, transaction: unknown): Promise<TClass>;
	deleteManyWithTransaction(
		query: TInterface,
		transaction: unknown
	): Promise<TClass[]>;

	//Eager Loading (busca com dados das entidades relacionadas)
	findAllWithEagerLoading(
		pageSize: number,
		page: number,
		orderOptions?: OrderOption[],
		associatedItemsLimit?: number
	): Promise<TClass[]>; //funções que já buscam com tudo (sequelize é include, mongoose nem lembro)
	findOneWithEagerLoading(
		query: TInterface,
		associatedItemsLimit?: number
	): Promise<TClass | null>;

	//TODO depois formalizar o includeOptions mas sem usar a classe do pacote
	findManyWithEagerLoading(
		pageSize: number,
		page: number,
		associatedItemsLimit?: number,
		query?: TInterface,
		includeOptions?: any,
		orderOptions?: OrderOption[]
	): Promise<TClass[]>;
	findByIdWithEagerLoading(
		id: number,
		associatedItemsLimit?: number
	): Promise<TClass | null>;
}