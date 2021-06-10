export interface IPluginFactory<HostType, PluginType> {
    token:Symbol;
    createPlugin(host:HostType):PluginType
}

export type PluginConstructor<PluginType = {}, HostType = {}> = {new(host:HostType):PluginType};
export type PluginClassWithToken<PluginType = {}, HostType = {}> = {token:Symbol, new(host:HostType):PluginType};
let pluginsMapKey = Symbol("Plugins Map");

export function definePluginFactory<HostType, PluginType ={}>(pluginClass: PluginConstructor<PluginType, HostType>, name:string):IPluginFactory<HostType, PluginType> {
    return {
        token:Symbol(name),
        createPlugin(host: HostType): PluginType {
            return new pluginClass(host);
        }
    }
}

export function pluginWithToken<HostType extends {}, PluginType = {}>(target: HostType, pluginClass:PluginConstructor<PluginType, HostType>, token:Symbol):PluginType {
    let abstractTarget = target as any;
    let pluginRef:PluginType = abstractTarget[token as any] as PluginType;
    if (!pluginRef) {
        pluginRef = new pluginClass(target);
        abstractTarget[token as any] = pluginRef;
    }
    return pluginRef;
}


export function pluginOf<HostType extends {}, PluginType = {}>(target:HostType, pluginClass:PluginConstructor<PluginType, HostType>):PluginType {
    let abstractTarget = target as any;
    let pluginsMap = abstractTarget[pluginsMapKey] as Map<string, Object>;
    if (pluginsMap === undefined) {
        pluginsMap = new Map<string, Object>();
        abstractTarget[pluginsMapKey] = pluginsMap;
    }
    let pluginObj = pluginsMap.get(pluginClass.name) as PluginType;
    if (pluginObj == undefined) {
        pluginObj = new pluginClass(target);
        pluginsMap.set(pluginClass.name, pluginObj);
    }
    return pluginObj;
}