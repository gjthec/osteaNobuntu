import { ClientSession, Connection, Model, Mongoose } from 'mongoose';
import { NotFoundError } from '../../../errors/client.error';
import { InternalServerError } from '../../../errors/internal.error';
import { buildCustomQuery } from './customQuery';
import {
	IDatabaseAdapter,
	OrderDirection,
	OrderOption
} from '../IDatabase.adapter';
import { Transaction } from 'sequelize';

/**
 * Implementação das funcionalidades do banco de dados com uso da biblioteca Mongoose
 */
export class MongooseAdapter<TInterface, TClass>
	implements IDatabaseAdapter<TInterface, TClass>
{
	private _model: Model<any>;
	private _databaseType: string;
	private _databaseConnection: Connection;

	constructor(
		model: Model<any>,
		databaseType: string,
		databaseConnection: Connection,
		protected jsonDataToResourceFn: (jsonData: any) => TClass
	) {
		this._model = model;
		this._databaseType = databaseType;
		this._databaseConnection = databaseConnection;
	}

	sanitizeOrderOptions(
		model: any,
		orderOptions: OrderOption[]
	): [string, OrderDirection][] {
		throw new Error('Method not implemented.');
	}

	get databaseType() {
		return this._databaseType;
	}

	get model() {
		return this._model;
	}

	get databaseConnection(): Connection {
		return this._databaseConnection;
	}

	async create(data: TInterface): Promise<TClass> {
		try {
			const item = new this._model(data);
			const newItem = await item.save();
			return this.jsonDataToResource(newItem);
		} catch (error) {
			throw new InternalServerError('Error to save data using Mongoose.', {
				cause: error
			});
		}
	}

	async findAll(limitPerPage: number, offset: number): Promise<TClass[]> {
		try {
			const returnedValues = await this._model
				.find({})
				.skip(offset)
				.limit(limitPerPage);

			return this.jsonDataToResources(returnedValues);
		} catch (error) {
			throw new InternalServerError('Error to save data using Mongoose.', {
				cause: error
			});
		}
	}

	async findOne(query: TInterface): Promise<TClass | null> {
		//TODO verificar na query se tem um "id" para tornar um "_id";

		try {
			const returnedValue = await this.model.findOne(query!);

			if (returnedValue == null) {
				return null;
			}

			return this.jsonDataToResource(returnedValue);
		} catch (error) {
			if (error instanceof NotFoundError) {
				throw error;
			}

			throw new InternalServerError('Error to find one data using Mongoose.', {
				cause: error
			});
		}
	}

	async findMany(query: TInterface): Promise<TInterface[]> {
		//TODO verificar na query se tem um "id" para tornar um "_id";

		try {
			const returnedValue = await this.model.find(query!);

			if (returnedValue == null) {
				return [];
			}

			return returnedValue;
		} catch (error) {
			if (error instanceof NotFoundError) {
				throw error;
			}

			throw new InternalServerError(
				'Error to find many documents using Mongoose.',
				{ cause: error }
			);
		}
	}

	async findById(id: number): Promise<TClass | null> {
		try {
			const returnedValue = await this._model.findById(id).exec();

			if (returnedValue == null) {
				return null;
			}

			return this.jsonDataToResource(returnedValue);
		} catch (error) {
			if (error instanceof NotFoundError) {
				throw error;
			}

			throw new InternalServerError(
				'Error to find data by id using Mongoose.',
				{ cause: error }
			);
		}
	}

	async getCount(): Promise<number> {
		try {
			return await this._model.countDocuments();
		} catch (error) {
			throw new InternalServerError('Error to get data count using Mongoose.', {
				cause: error
			});
		}
	}

	async update(id: number, data: Object): Promise<TClass | null> {
		try {
			const returnedValue = await this._model.findByIdAndUpdate(id, data, {
				useFindAndModify: false,
				new: true
			});

			if (returnedValue == null) {
				return null;
			}

			return this.jsonDataToResource(returnedValue);
		} catch (error) {
			if (error instanceof NotFoundError) {
				throw error;
			}

			throw new InternalServerError('Error to update data using Mongoose.', {
				cause: error
			});
		}
	}

	async delete(id: number): Promise<TClass | null> {
		try {
			const returnedValue = await this._model.findByIdAndDelete(id);

			if (returnedValue == null) {
				return null;
			}

			return this.jsonDataToResource(returnedValue);
		} catch (error) {
			if (error instanceof NotFoundError) {
				throw error;
			}

			throw new InternalServerError('Error to delete data using Mongoose.', {
				cause: error
			});
		}
	}

	deleteMany(query: TInterface): Promise<TClass[]> {
		throw new InternalServerError('Method not implemented.');
	}

	deleteManyWithTransaction(
		query: TInterface,
		transaction: ClientSession
	): Promise<TClass[]> {
		throw new InternalServerError('Method not implemented.');
	}

	async deleteAll(): Promise<void> {
		try {
			await this._model.deleteMany({});
		} catch (error) {
			throw new InternalServerError(
				'Error to delete all documents using Mongoose.',
				{ cause: error }
			);
		}
	}

	async executeQuery(query: string): Promise<Object> {
		throw new InternalServerError('Method not implemented');
	}

	buildCustomQuery(filterValues: any[], filterConditions: string[]) {
		return buildCustomQuery(filterValues, filterConditions);
	}

	async findUsingCustomQuery(query: any): Promise<TClass[]> {
		try {
			return await this._model.aggregate(query);
		} catch (error) {
			throw new InternalServerError(
				'Error to execute custom query to find data using Sequelize.',
				{ cause: error }
			);
		}
	}

	protected jsonDataToResources(jsonData: any[]): TClass[] {
		const resources: TClass[] = [];
		jsonData.forEach((element) =>
			resources.push(this.jsonDataToResourceFn(element.toObject()))
		);
		return resources;
	}

	protected jsonDataToResource(jsonData: any): TClass {
		return this.jsonDataToResourceFn(jsonData.toObject());
	}

	async startTransaction(): Promise<ClientSession> {
		try {
			const transaction = await this.databaseConnection.startSession();
			transaction.startTransaction();
			return transaction;
		} catch (error) {
			throw new InternalServerError(
				'Error to start transaction using Mongoose.',
				{ cause: error }
			);
		}
	}

	async commitTransaction(transaction: ClientSession): Promise<void> {
		try {
			await transaction.commitTransaction();
			await transaction.endSession();
		} catch (error) {
			throw new InternalServerError(
				'Error to commit transaction using Mongoose.',
				{ cause: error }
			);
		}
	}

	async rollbackTransaction(transaction: ClientSession): Promise<void> {
		try {
			await transaction.abortTransaction();
			await transaction.endSession();
		} catch (error) {
			throw new InternalServerError(
				'Error to commit transaction using Mongoose.',
				{ cause: error }
			);
		}
	}

	async createWithTransaction(
		data: TInterface,
		transaction: ClientSession
	): Promise<TClass> {
		try {
			const returnedValue = await this.model.create([data], {
				session: transaction
			});
			return this.jsonDataToResource(returnedValue[0]);
		} catch (error) {
			this.rollbackTransaction(transaction);
			throw new InternalServerError(
				'Error to save data with transaction using Mongoose.',
				{ cause: error }
			);
		}
	}

	async updateWithTransaction(
		id: number,
		data: Object,
		transaction: ClientSession
	): Promise<TClass> {
		try {
			const returnedValue = await this._model.findByIdAndUpdate(id, data, {
				useFindAndModify: false,
				new: true,
				session: transaction
			});

			if (returnedValue == null) {
				throw new NotFoundError('NOT_FOUND');
			}

			return this.jsonDataToResource(returnedValue);
		} catch (error) {
			this.rollbackTransaction(transaction);
			if (error instanceof NotFoundError) {
				throw error;
			}

			throw new InternalServerError(
				'Error to update data with transaction using Mongoose.',
				{ cause: error }
			);
		}
	}

	async deleteWithTransaction(
		id: number,
		transaction: ClientSession
	): Promise<TClass> {
		try {
			const returnedValue = await this._model.findByIdAndDelete(id, {
				session: transaction
			});

			if (returnedValue == null) {
				throw new NotFoundError('NOT_FOUND');
			}

			return this.jsonDataToResource(returnedValue);
		} catch (error) {
			this.rollbackTransaction(transaction);
			if (error instanceof NotFoundError) {
				throw error;
			}

			throw new InternalServerError(
				'Error to delete data with transaction using Mongoose.',
				{ cause: error }
			);
		}
	}

	//TODO procurar a função de varredura das classes que são relacionadas para preencher o populate
	async findAllWithEagerLoading(
		limitPerPage: number,
		offset: number
	): Promise<TClass[]> {
		throw new InternalServerError('Method not implemented');
	}

	async findOneWithEagerLoading(query: TInterface): Promise<TClass | null> {
		throw new InternalServerError('Method not implemented');
	}

	findManyWithEagerLoading(
		pageSize: number,
		page: number,
		associatedItemsLimit?: number,
		query?: TInterface | undefined,
		includeOptions?: any,
		orderOptions?: OrderOption[]
	): Promise<TClass[]> {
		throw new Error('Method not implemented.');
	}

	async findByIdWithEagerLoading(id: number): Promise<TClass | null> {
		throw new InternalServerError('Method not implemented');
	}

	resincronizeSequence(
		schemaName: string,
		tableName: string,
		transaction: Transaction
	): Promise<object> {
		throw new Error('Method not implemented.');
	}
}
