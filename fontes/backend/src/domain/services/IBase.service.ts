import { Model } from "mongoose";
import { FilterValue } from "../../utils/mongoose/customQuery.util";

export interface IBaseService<TInterface, TClass> {
  readonly repository: any;
  readonly databaseType: string;

  create(data: TInterface): Promise<TClass>;
  findAll(limitPerPage: number, offset: number): Promise<TClass[] | null>;
  findOne(query: TInterface): Promise<TClass>;
  findMany(query: TInterface): Promise<TInterface[]>;
  findById(id: number): Promise<TClass>;
  getCount(): Promise<number>;
  update(id: number, data: Object): Promise<TClass>;
  delete(id: number): Promise<TClass>;
  deleteAll(): Promise<void>;
  executeQuery(query: string): Promise<Object>;
  findCustom(filterValues: FilterValue[], filterConditions: string[], model: Model<any> | typeof Model): Promise<TClass[] | null>;
}
