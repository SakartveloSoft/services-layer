export class NotImplementedError extends Error {
    private serviceName: string;
    private operationName: string;
    constructor(serviceName:string, operationName:string) {
        super(`Operation ${operationName} not implemented for service ${serviceName}`);
        this.serviceName = serviceName;
        this.operationName = operationName;
    }
}