import {pluginWithToken} from "./plugins";

type CallbackType<ValuesT=any> = (values:ValuesT) => void;


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
        this.add(realCallback);
    }
    notify(v:Partial<ValuesT>):void {
        for(let callback of this._callbacks) {
            callback(v as ValuesT);
        }
    }
}
export class EventData {

}

function getItemFromMap<T extends {}>(items:Map<string, object>, key:string, factory:() => T):T {
    let entry:T;
    let rawEntry = items.get(key);
    if (!rawEntry) {
        entry = factory();
        items.set(key, entry);
    } else {
        entry = rawEntry as T;
        if (!entry) {
            entry = factory();
            items.set(key, entry);
        }
    }
    return entry;
}

abstract class EventEmitterBase {
    private readonly _events:Map<string, Object> = new Map<string, Object>();
    protected getEventEntry<T extends EventData>(event:EventClass<T>):EventReference<T> {
        return getItemFromMap<EventReference<T>>(this._events, event.name, () => new EventReference<T>());
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



export type OwnedEventClass<HostType, EventType extends OwnedEventData<HostType>> = { new (host:HostType):EventType}
export class OwnedEmitter<TOwner extends {}> {
    private _events = new Map<string, Object>()
    constructor(protected owner:TOwner) {
    }
    protected getOwnedEventEntry<T extends OwnedEventData<TOwner>>(event:OwnedEventClass<TOwner,T>):EventReference<T> {
        return getItemFromMap<EventReference<T>>(
            this._events,
            event.name,
            () => new EventReference<T>());
    }

    on<T extends OwnedEventData<TOwner>>(event: OwnedEventClass<TOwner, T>, callback: CallbackType<T>) {
        this.getOwnedEventEntry<T>(event).add(callback);
    }
    off<T extends OwnedEventData<TOwner>>(event:OwnedEventClass<TOwner, T>, callback: CallbackType<T>) {
        this.getOwnedEventEntry(event).remove(callback);
    }
    once<T extends OwnedEventData<TOwner>>(event:OwnedEventClass<TOwner,T>, callback:CallbackType<T>) {
        this.getOwnedEventEntry(event).addOnce(callback);
    }
    emit<T extends OwnedEventData<TOwner>>(event:OwnedEventClass<TOwner, T>, values:Partial<T>) {
        this.getOwnedEventEntry(event).notify({...values, source: this.owner });
    }
}

const eventsRef = Symbol('Events ref');


export function eventsOf<T extends {}>(owner:T):OwnedEmitter<T> {
    return pluginWithToken<T, OwnedEmitter<T>>(owner, OwnedEmitter, eventsRef);
}