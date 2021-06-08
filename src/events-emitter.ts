import {pluginOf} from "./plugins";
import {string} from "@sakartvelosoft/type-system";

type CallbackType<ValuesT=any> = (values:Partial<ValuesT>) => void;


class EventReference<ValuesT = any, ResultT = void> {
    private _callbacks: CallbackType<ValuesT>[] = [];
    add(callback:CallbackType<ValuesT>):void {
        this._callbacks.push(callback);
    }
    remove(callback:CallbackType<ValuesT>):void {
        let pos = this._callbacks.indexOf(callback);
        if (pos >= 0) {
            this._callbacks.splice(pos);
        }
    }
    addOnce(callback:CallbackType<ValuesT>):void {
        let realCallback:CallbackType<ValuesT> =  (v) => {
            try {
                let result = callback(v);
                if (result !== void(0) && result !== undefined) {
                    return result;
                }
            } finally {
                this.remove(realCallback);
            }
        }
    }
    notify(v:Partial<ValuesT>):void {
        for(let callback of this._callbacks) {
            callback(v);
        }
    }
}
export class EventData {

}

abstract class EventEmitterBase {
    private readonly _events:Map<string, Object> = new Map<string, Object>();
    protected getEventEntry<T=EventData>(event:EventClass<T>):EventReference<T> {
        let callbackEntry:EventReference<T>;
        let entry = this._events.get(event.name);
        if (!entry) {
            callbackEntry = new EventReference<T>();
            this._events.set(event.name, callbackEntry);
        } else {
            callbackEntry = entry as EventReference<T>;
            if (!callbackEntry) {
                callbackEntry = new EventReference<T>();
                this._events.set(event.name, callbackEntry);
            }
        }
        return callbackEntry;
    }

}

type EventClass<T extends EventData> = {new():T}
export class EventsEmitter extends EventEmitterBase {
    on<T=EventData>(event:EventClass<T>, callback:CallbackType<T>):void {
        this.getEventEntry(event).add(callback);
    }
    once<T=EventData>(event:EventClass<T>, callback:CallbackType<T>):void {
        this.getEventEntry(event).addOnce(callback);
    }
    off<T=EventData>(event:EventClass<T>, callback:CallbackType<T>):void {
        this.getEventEntry(event).remove(callback);
    }
    emit<T=EventData>(event:EventClass<T>, values:Partial<T>) {
        this.getEventEntry(event).notify(values);
    }
}



export class OwnedEventData<TOwner extends {}> extends EventData {
    public source?:TOwner;
}




export class OwnedEmitter<TOwner extends {}> extends EventEmitterBase{
    constructor(protected owner:TOwner) {
        super();
    }

    on<T = OwnedEventData<TOwner>>(event: EventClass<T>, callback: CallbackType<T>) {
        super.getEventEntry(event).add(callback);
    }
    off<T = OwnedEventData<TOwner>>(event:EventClass<T>, callback: CallbackType<T>) {
        super.getEventEntry(event).remove(callback);
    }
    once<T = OwnedEventData<TOwner>>(event:EventClass<T>, callback:CallbackType<T>) {
        super.getEventEntry(event).addOnce(callback);
    }
    emit<T = OwnedEventData<TOwner>>(event:EventClass<T>, values:Partial<T>) {
        super.getEventEntry(event).notify({...values, source: this.owner });
    }
}

export function eventsOf<T extends {}>(owner:T):OwnedEmitter<T> {
    return pluginOf<T, OwnedEmitter<T>>(owner, class OwnedEventsPlugin extends OwnedEmitter<T>{
        constructor() {
            super(owner);
        }
    });
}