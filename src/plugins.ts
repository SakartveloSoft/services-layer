export type PluginConstructor<PluginType = {}, HostType = {}> = {new(host:HostType):PluginType};

let pluginsMapKey = Symbol("Plugins Map");

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