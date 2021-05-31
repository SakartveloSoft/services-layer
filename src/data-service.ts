import {IDataSearch, DataServiceContract, IDataContract, ISearchResult} from "./service-types";
import {TypeClass} from "@sakartvelosoft/type-system";
import {CoreService} from "./core-service";

export class DataService<T extends IDataContract> extends CoreService<DataServiceContract<T>>{
    constructor(classRef:TypeClass<DataServiceContract<T>>) {
        super(classRef);
    }
    async find(search:IDataSearch<T>):Promise<ISearchResult<T>> {
        return this.invokeMethod('find', search);
    }
    async get(id:string):Promise<T>{
        return this.invokeMethod("get", id);
    }
    async create(properties:Partial<T>):Promise<T> {
        return this.invokeMethod("create", properties);
    }
    async update(properties:Partial<T>):Promise<T> {
        return this.invokeMethod("update", properties);
    }
    async recycle(id:string):Promise<T> {
        return this.invokeMethod("recycle", id);
    }
    async restore(properties:Partial<T>):Promise<T> {
        return this.invokeMethod("restore", properties);
    }
    async erase(properties:Partial<T>):Promise<T> {
        return this.invokeMethod("erase", properties);
    }
}