import { ClientSession } from 'mongoose';
import { Transaction } from 'sequelize';
import { IBaseRepository } from './ibase.repository';
import {
	IDatabaseAdapter,
	OrderOption
} from '../../infra/database/IDatabase.adapter';
import { TenantConnection } from '../entities/tenantConnection.model';
import { FilterValue } from '../../infra/database/iFilterValue';

export default abstract class BaseRepository<TInterface, TClass>
	implements IBaseRepository<TInterface, TClass>
{
	public adapter: IDatabaseAdapter<TInterface, TClass>;
	public _tenantConnection: TenantConnection;

	constructor(
		adapter: IDatabaseAdapter<TInterface, TClass>,
		tenantConnection: TenantConnection
	) {
		this.adapter = adapter;
		this._tenantConnection = tenantConnection;
	}

	get tenantConnection() {
		return this._tenantConnection;
	}

	create(data: TInterface): Promise<TClass> {
		return this.adapter.create(data);
	}

	findAll(pageSize: number, page: number): Promise<TClass[]> {
		return this.adapter.findAll(pageSize, page);
	}

	findOne(query: TInterface): Promise<TClass | null> {
		return this.adapter.findOne(query);
	}

	findMany(
		query: TInterface,
		pageSize?: number,
		page?: number
	): Promise<TInterface[]> {
		return this.adapter.findMany(query, pageSize, page);
	}

	findById(id: number): Promise<TClass | null> {
		return this.adapter.findById(id);
	}

	getCount(query?: any, includeOptions?: any): Promise<number> {
		return this.adapter.getCount(query, includeOptions);
	}

	update(id: number, data: Object): Promise<TClass | null> {
		return this.adapter.update(id, data);
	}

	delete(id: number): Promise<TClass | null> {
		return this.adapter.delete(id);
	}

	deleteAll(): Promise<void> {
		return this.adapter.deleteAll();
	}

	executeQuery(
		query: string,
		replacements: Record<string, any>,
		transaction?: unknown
	): Promise<Object> {
		return this.adapter.executeQuery(query, replacements);
	}

	buildCustomQuery(
		filterValues: FilterValue[],
		filterConditions: string[],
		databaseModels?: Map<string, any>,
		targetModelName?: string
	): any {
		return this.adapter.buildCustomQuery(
			filterValues,
			filterConditions,
			databaseModels,
			targetModelName
		);
	}

	startTransaction(): Promise<any> {
		return this.adapter.startTransaction();
	}

	commitTransaction(transaction: ClientSession | Transaction): Promise<void> {
		return this.adapter.commitTransaction(transaction);
	}

	rollbackTransaction(transaction: ClientSession | Transaction): Promise<void> {
		return this.adapter.commitTransaction(transaction);
	}

	createWithTransaction(
		data: TInterface,
		transaction: ClientSession | Transaction
	): Promise<TClass> {
		return this.adapter.createWithTransaction(data, transaction);
	}

	updateWithTransaction(
		id: number,
		data: Object,
		transaction: ClientSession | Transaction
	): Promise<TClass> {
		return this.adapter.updateWithTransaction(id, data, transaction);
	}

	deleteWithTransaction(
		id: number,
		transaction: ClientSession | Transaction
	): Promise<TClass> {
		return this.adapter.deleteWithTransaction(id, transaction);
	}

	deleteManyWithTransaction(
		query: TInterface,
		transaction: ClientSession | Transaction
	): Promise<TClass[]> {
		return this.adapter.deleteManyWithTransaction(query, transaction);
	}

	findAllWithEagerLoading(
		pageSize: number,
		page: number,
		orderOptions?: OrderOption[],
		associatedItemsLimit?: number
	): Promise<TClass[]> {
		return this.adapter.findAllWithEagerLoading(
			pageSize,
			page,
			orderOptions,
			associatedItemsLimit
		);
	}

	findOneWithEagerLoading(
		query: TInterface,
		associatedItemsLimit?: number
	): Promise<TClass | null> {
		return this.adapter.findOneWithEagerLoading(query, associatedItemsLimit);
	}

	findManyWithEagerLoading(
		pageSize: number,
		page: number,
		associatedItemsLimit?: number,
		query?: TInterface | any,
		includeOptions?: any,
		orderOptions?: OrderOption[]
	): Promise<TClass[]> {
		return this.adapter.findManyWithEagerLoading(
			pageSize,
			page,
			associatedItemsLimit,
			query,
			includeOptions,
			orderOptions
		);
	}

	findByIdWithEagerLoading(
		id: number,
		associatedItemsLimit?: number
	): Promise<TClass | null> {
		return this.adapter.findByIdWithEagerLoading(id, associatedItemsLimit);
	}

	resincronizeSequence(
		schemaName: string,
		tableName: string,
		transaction: Transaction
	): Promise<object> {
		return this.adapter.resincronizeSequence(
			schemaName,
			tableName,
			transaction
		);
	}
}