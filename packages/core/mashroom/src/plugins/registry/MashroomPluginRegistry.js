// @flow

import EventEmitter from 'events';
import {cloneAndFreezeObject, cloneAndFreezeArray} from '@mashroom/mashroom-utils/lib/readonly_utils';
import {createPluginConfig} from '../../utils/plugin_utils';
import MashroomPluginPackageRegistryConnector from './MashroomPluginPackageRegistryConnector';
import MashroomPluginRegistryConnector from './MashroomPluginRegistryConnector';

import type {
    MashroomPluginPackagePath,
    MashroomPluginPackage,
    MashroomPluginLoaderMap,
    MashroomLogger,
    MashroomLoggerFactory,
    MashroomPluginLoader,
    MashroomPluginContextHolder,
    MashroomPluginPackageEvent,
    MashroomPluginDefinition,
    MashroomPlugin as MashroomPluginType,
    MashroomPluginType as MashroomPluginTypeType,
} from '../../../type-definitions';
import type {
    MashroomPluginPackageFactory,
    MashroomPluginRegistry as MashroomPluginRegistryType,
    MashroomPluginPackageScanner,
    MashroomPluginFactory,
    MashroomPluginPackageRegistryConnector as MashroomPluginPackageRegistryConnectorType,
    MashroomPluginRegistryConnector as MashroomPluginRegistryConnectorType,
    MashroomPluginRegistryEvent,
    MashroomPluginRegistryEventName,
} from '../../../type-definitions/internal';

export default class MashroomPluginRegistry implements MashroomPluginRegistryType {

    _scanner: MashroomPluginPackageScanner;
    _pluginPackageFactory: MashroomPluginPackageFactory;
    _pluginFactory: MashroomPluginFactory;
    _pluginContextHolder: MashroomPluginContextHolder;
    _log: MashroomLogger;
    _pluginPackagePaths: Array<MashroomPluginPackagePath>;
    _pluginPackages: Map<MashroomPluginPackage, MashroomPluginPackageRegistryConnectorType>;
    _plugins: Map<MashroomPluginType, MashroomPluginRegistryConnectorType>;
    _pluginLoaders: MashroomPluginLoaderMap;
    _pluginsNoLoader: Array<MashroomPluginType>;
    _pluginsMissingRequirements: Array<MashroomPluginType>;
    _eventEmitter: EventEmitter;

    _boundOnPackageReady: MashroomPluginPackageEvent => void;
    _boundOnPackageError: MashroomPluginPackageEvent => void;

    constructor(scanner: MashroomPluginPackageScanner, pluginPackageFactory: MashroomPluginPackageFactory, pluginFactory: MashroomPluginFactory,
                pluginContextHolder: MashroomPluginContextHolder, loggerFactory: MashroomLoggerFactory) {
        this._scanner = scanner;
        this._pluginPackageFactory = pluginPackageFactory;
        this._pluginFactory = pluginFactory;
        this._pluginContextHolder = pluginContextHolder;
        this._log = loggerFactory('mashroom.plugins.registry');
        this._pluginPackagePaths = [];
        this._pluginPackages = new Map();
        this._plugins = new Map();
        this._pluginLoaders = {};
        this._pluginsNoLoader = [];
        this._pluginsMissingRequirements = [];
        this._eventEmitter = new EventEmitter();

        this._boundOnPackageReady = this._onPackageReady.bind(this);
        this._boundOnPackageError = this._onPackageError.bind(this);

        this._init();
    }

    registerPluginLoader(type: MashroomPluginTypeType, loader: MashroomPluginLoader) {
        this._pluginLoaders[type] = loader;
        this._checkPluginsNoLoader();
        // If the loader was reloaded re-register all plugins
        this._reRegisterLoadedPlugins(type, loader);
    }

    unregisterPluginLoader(type: MashroomPluginTypeType, loader: MashroomPluginLoader) {
        if (this._pluginLoaders[type] && this._pluginLoaders[type].name === loader.name) {
            delete this._pluginLoaders[type];
        }
    }

    on(eventName: MashroomPluginRegistryEventName, listener: MashroomPluginRegistryEvent => void) {
        this._eventEmitter.on(eventName, listener);
    }

    removeListener(eventName: MashroomPluginRegistryEventName, listener: MashroomPluginRegistryEvent => void): void {
        this._eventEmitter.removeListener(eventName, listener);
    }

    _init() {
        this._scanner.on('packageAdded', this._onPackageAdded.bind(this));
        this._scanner.on('packageUpdated', this._onPackageUpdated.bind(this));
        this._scanner.on('packageRemoved', this._onPackageRemoved.bind(this));
    }

    _onPackageAdded(path: string) {
        const connector = new MashroomPluginPackageRegistryConnector();
        const pluginPackage = this._pluginPackageFactory(path, connector);

        pluginPackage.on('ready', this._boundOnPackageReady);
        pluginPackage.on('error', this._boundOnPackageError);

        this._pluginPackages.set(pluginPackage, connector);
    }

    _onPackageUpdated(path: string) {
        const pluginPackage = this._findPluginPackageByPath(path);
        if (!pluginPackage || pluginPackage.status === 'building') {
            return;
        }

        const connector = this._pluginPackages.get(pluginPackage);
        if (connector) {
            connector.emitUpdated();
        }
    }

    _onPackageRemoved(path: string) {
        const pluginPackage = this._findPluginPackageByPath(path);
        if (!pluginPackage) {
            return;
        }

        const connector = this._pluginPackages.get(pluginPackage);
        if (connector) {
            connector.emitRemoved();
        }

        this._pluginPackages.delete(pluginPackage);
        pluginPackage.removeListener('ready', this._boundOnPackageReady);
        pluginPackage.removeListener('error', this._boundOnPackageError);

        this._onPackageReady({
            pluginsRemoved: pluginPackage.pluginDefinitions,
            pluginPackage,
        });
    }

    _onPackageReady(event: MashroomPluginPackageEvent) {
        if (event.pluginsAdded) {
            event.pluginsAdded.forEach((addedPluginDefinition) => this._addPlugin(addedPluginDefinition, event.pluginPackage));
        }
        if (event.pluginsUpdated) {
            event.pluginsUpdated.forEach(async (updatedPluginDefinition) => {
                const existingPlugin = this._findPluginByDefinition(updatedPluginDefinition);
                if (existingPlugin) {
                    if (existingPlugin.type !== updatedPluginDefinition.type) {
                        await this._removePlugin(existingPlugin);
                        await this._addPlugin(updatedPluginDefinition, event.pluginPackage);
                    } else {
                        await this._updatePlugin(existingPlugin, updatedPluginDefinition);
                    }
                }
            });
        }
        if (event.pluginsRemoved) {
            event.pluginsRemoved.forEach((pluginDefinition) => {
                const existingPlugin = this._findPluginByDefinition(pluginDefinition);
                if (existingPlugin) {
                    this._removePlugin(existingPlugin);
                }
            });
        }
    }

    _onPackageError(event: MashroomPluginPackageEvent) {
        const loadedPlugins = this._loadedPlugins().filter((p) => p.pluginPackage === event.pluginPackage);
        if (loadedPlugins.length > 0) {
            this._log.warn(`Plugin package ${event.pluginPackage.name} has an error but ${loadedPlugins.length} loaded plugins. They may no longer work correctly!`);
        }
    }

    async _addPlugin(pluginDefinition: MashroomPluginDefinition, pluginPackage: MashroomPluginPackage) {
        this._log.info(`Adding plugin: ${pluginDefinition.name}, type: ${pluginDefinition.type}`);
        const connector = new MashroomPluginRegistryConnector();
        const plugin = this._pluginFactory(pluginDefinition, pluginPackage, connector);

        this._plugins.set(plugin, connector);

        await this._load(plugin, connector);

        await this._checkPluginsMissingRequirements();
    }

    async _updatePlugin(plugin: MashroomPluginType, updatedPluginDefinition: MashroomPluginDefinition) {
        this._log.info(`Reloading plugin: ${plugin.name}, type: ${plugin.type}`);
        const connector = this._plugins.get(plugin);
        if (connector) {
            connector.emitUpdated({
                updatedPluginDefinition,
            });
            await this._load(plugin, connector);
        }
    }

    async _removePlugin(plugin: MashroomPluginType) {
        this._log.info(`Unloading plugin: ${plugin.name}, type: ${plugin.type}`);
        this._plugins.delete(plugin);
        this._removeFromPluginsNoLoader(plugin);
        this._removeFromPluginsMissingRequirements(plugin);

        await this._unload(plugin);
    }

    async _load(plugin: MashroomPluginType, pluginConnector: MashroomPluginRegistryConnectorType) {
        const loader = this._pluginLoaders[plugin.type];
        if (!loader) {
            this._log.info(`No loader found for plugin: ${plugin.name}, type: ${plugin.type}`);
            pluginConnector.emitError({
                errorMessage: 'No loader found',
            });
            if (this._pluginsNoLoader.indexOf(plugin) === -1) {
                this._pluginsNoLoader.push(plugin);
            }
            return;
        }

        const loadedPluginNames = this._loadedPlugins().map((p) => p.name);
        const missingPlugins = [];
        const requires = plugin.pluginDefinition.requires;
        if (requires && Array.isArray(requires)) {
            for (const requiredPluginName of requires) {
                if (loadedPluginNames.indexOf(requiredPluginName) === -1) {
                    missingPlugins.push(requiredPluginName);
                }
            }
        }

        if (missingPlugins.length > 0) {
            this._log.info(`Some required plugins are missing for plugin: ${plugin.name}: ${missingPlugins.join(', ')}. Try to reload later.`);
            pluginConnector.emitError({
                errorMessage: `Missing required plugins: ${missingPlugins.join(', ')}`,
            });
            if (this._pluginsMissingRequirements.indexOf(plugin) === -1) {
                this._pluginsMissingRequirements.push(plugin);
            }
            return;
        }

        if (this._loadedPlugins().find((p) => p.name === plugin.name)) {
            this._eventEmitter.emit('unload', {
                pluginName: plugin.name,
            });
        }

        const pluginConfig = createPluginConfig(plugin, loader, this._pluginContextHolder.getPluginContext());

        try {
            await loader.load(plugin, pluginConfig, this._pluginContextHolder);
            pluginConnector.emitLoaded({
                pluginConfig,
            });
            this._eventEmitter.emit('loaded', {
                pluginName: plugin.name,
            });
        } catch (error) {
            this._log.error(`Loading plugin: ${plugin.name}, type: ${plugin.type} failed!`, error);
            pluginConnector.emitError({
                errorMessage: `Loading failed (${error.toString()}`,
            });
        }
    }

    async _unload(plugin: MashroomPluginType) {
        const loader = this._pluginLoaders[plugin.type];
        if (!loader) {
            this._log.info(`No loader found for plugin: ${plugin.name}, type: ${plugin.type}. Cannot unload!`);
            return;
        }

        this._eventEmitter.emit('unload', {
            pluginName: plugin.name,
        });

        try {
            await loader.unload(plugin);
        } catch (error) {
            this._log.error(`Unloading plugin: ${plugin.name}, type: ${plugin.type} failed!`, error);
        }
    }

    async _reRegisterLoadedPlugins(pluginType: MashroomPluginTypeType, pluginLoader: MashroomPluginLoader) {
        const loadedPlugins = this._findLoadedPluginsByType(pluginType);
        if (loadedPlugins.length > 0) {
            this._log.debug(`Re-registering loaded plugins of type ${String(pluginType)}`, loadedPlugins);
            for (let i = 0; i < loadedPlugins.length; i++) {
                const plugin = loadedPlugins[i];
                const pluginConfig = createPluginConfig(plugin, pluginLoader, this._pluginContextHolder.getPluginContext());
                try {
                    await pluginLoader.load(plugin, pluginConfig, this._pluginContextHolder);
                    this._eventEmitter.emit('loaded', {
                        pluginName: plugin.name,
                    });
                } catch (error) {
                    this._log.error(`Loading plugin: ${plugin.name}, type: ${plugin.type} failed!`, error);
                    const pluginConnector = this._plugins.get(plugin);
                    if (pluginConnector) {
                        pluginConnector.emitError({
                            errorMessage: `Loading failed (${error.toString()}`,
                        });
                    }
                }
            }
        }
    }

    async _checkPluginsNoLoader() {
        const unloadedPlugins = [...this._pluginsNoLoader];
        for (const unloadedPlugin of unloadedPlugins) {
            if (this._pluginsNoLoader.indexOf(unloadedPlugin) === -1) {
                // If the re-load of a plugin takes a long time another call of
                // _checkPluginsNoLoader() could have loaded this already
                continue;
            }
            this._removeFromPluginsNoLoader(unloadedPlugin);

            const connector = this._plugins.get(unloadedPlugin);
            if (connector) {
                this._log.info(`Re-try to load plugin with no loader: ${unloadedPlugin.name}`);
                await this._load(unloadedPlugin, connector);
            }
        }
    }

    async _checkPluginsMissingRequirements() {
        const unloadedPlugins = [...this._pluginsMissingRequirements];
        for (const unloadedPlugin of unloadedPlugins) {
            if (this._pluginsMissingRequirements.indexOf(unloadedPlugin) === -1) {
                // If the re-load of a plugin takes a long time another call of
                // __checkPluginsMissingRequirements() could have loaded this already
                continue;
            }
            this._removeFromPluginsMissingRequirements(unloadedPlugin);

            const connector = this._plugins.get(unloadedPlugin);
            if (connector) {
                this._log.info(`Re-try to load plugin with missing requirements: ${unloadedPlugin.name}`);
                await this._load(unloadedPlugin, connector);
            }
        }

        // When we were able to load plugins with missing requirements,
        // they might fulfill the requirements of other plugins now
        if (unloadedPlugins.length > this._pluginsMissingRequirements.length) {
            await this._checkPluginsMissingRequirements();
        }
    }

    _removeFromPluginsNoLoader(plugin: MashroomPluginType) {
        const idx = this._pluginsNoLoader.indexOf(plugin);
        if (idx !== -1) {
            this._pluginsNoLoader.splice(idx, 1);
        }
    }

    _removeFromPluginsMissingRequirements(plugin: MashroomPluginType) {
        const idx = this._pluginsMissingRequirements.indexOf(plugin);
        if (idx !== -1) {
            this._pluginsMissingRequirements.splice(idx, 1);
        }
    }

    _findPluginPackageByPath(path: string) {
        for (const pluginPackage of this._pluginPackages.keys()) {
            if (pluginPackage.pluginPackagePath === path) {
                return pluginPackage;
            }
        }
        return null;
    }

    _findPluginByDefinition(def: MashroomPluginDefinition) {
        for (const plugin of this._plugins.keys()) {
            if (plugin.name === def.name) {
                return plugin;
            }
        }
        return null;
    }

    _findLoadedPluginsByType(type: MashroomPluginTypeType): Array<MashroomPluginType> {
        return this._loadedPlugins().filter((p) => p.type === type);
    }

    _loadedPlugins(): Array<MashroomPluginType> {
        return this.plugins.filter((p) => p.status === 'loaded');
    }

    get plugins(): Array<MashroomPluginType> {
        return cloneAndFreezeArray([...this._plugins.keys()]);
    }

    get pluginLoaders(): MashroomPluginLoaderMap {
        return cloneAndFreezeObject(this._pluginLoaders);
    }

    get pluginPackages(): Array<MashroomPluginPackage> {
        return cloneAndFreezeArray([...this._pluginPackages.keys()]);
    }

}
