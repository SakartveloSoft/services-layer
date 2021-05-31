import {ServiceContract} from "./service-types";
import {TypeClass} from "@sakartvelosoft/type-system";

export class CoreService<T extends ServiceContract> {
    private readonly _impl: T;
    constructor(implementationType:TypeClass<T>) {
        this._impl = new implementationType();
    }
    async invokeMethod(name:keyof T, ...values:any):Promise<any> {
        let func = this._impl[name];
        return await func.apply(this._impl, ...values);
    }
}