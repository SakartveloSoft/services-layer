import {IEntity} from "@sakartvelosoft/type-system";
import {NotImplementedError} from "./not-implemented-error";

export interface ServiceContract {
    [name:string]:Function;
}

export interface IDataOperationMetadata {
    id:string;
    completedAt:Date;
    userId?:string;
    userName?:string;
}

export interface IDataContract extends IEntity {
    id?:string;
    created?:IDataOperationMetadata;
    updated?:IDataOperationMetadata;
    recycled?:IDataOperationMetadata;
    restored?:IDataOperationMetadata;
}

export enum DataSearchOperator {
    Equals="$eq",
    Greater = "$gt",
    Less = "$lt",
    GreaterOrEqual = "$gte",
    LessOrEqual = "$lte",
    StartsWith = "$startsWith",
    And = "$and",
    Or = "$or",
}
export interface DataSearchFilter {
    operator: DataSearchOperator;
    operand?:string|boolean|Date|number|null;
    filters?:DataSearchFilter[];
}

export interface IDataSearch<T extends IEntity> {
    filters?:{[name:string]:DataSearchFilter|string|Date|number|boolean}|DataSearchFilter;
    pageSize?:number;
    pageIndex?:number;
    sortBy?:keyof T;
}

export interface ISearchResult<T extends IEntity> {
    items:T[];
    pageIndex?:number;
    pageSize?:number;
    totalItems?:number;
    hasNextPage?:boolean;
}

export class DataServiceContract<T extends IDataContract> implements ServiceContract {
    find(search:IDataSearch<T>):ISearchResult<T> {
        throw new NotImplementedError(this.constructor.name, 'find')
    }
    get(id:string):Promise<T> {
        throw new NotImplementedError(this.constructor.name, "get");
    }
    create(properties:Partial<T>):Promise<T> {
        throw new NotImplementedError(this.constructor.name, "create");
    }
    update(properties:Partial<T>):Promise<T> {
        throw new NotImplementedError(this.constructor.name, "update");
    }

    recycle(id:string):Promise<T> {
        throw new NotImplementedError(this.constructor.name, "recycle");
    }
    restore(id:string):Promise<T> {
        throw new NotImplementedError(this.constructor.name, "restore");
    }
    erase(id:string):Promise<T> {
        throw new NotImplementedError(this.constructor.name, "erase");
    }

    [name: string]: Function;
}