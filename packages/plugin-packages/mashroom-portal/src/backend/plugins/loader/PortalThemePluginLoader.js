// @flow

import path from 'path';

import type {MashroomPluginLoader, MashroomPlugin, MashroomPluginConfig, MashroomPluginContextHolder, MashroomLogger, MashroomLoggerFactory} from '@mashroom/mashroom/type-definitions';
import type {MashroomPortalTheme, MashroomPortalPluginRegistry, MashroomPortalThemePluginBootstrapFunction} from '../../../../type-definitions';

export default class PortalThemePluginLoader implements MashroomPluginLoader {

    _registry: MashroomPortalPluginRegistry;
    _log: MashroomLogger;

    constructor(registry: MashroomPortalPluginRegistry, loggerFactory: MashroomLoggerFactory) {
        this._registry = registry;
        this._log = loggerFactory('mashroom.portal.plugin.loader');
    }

    get name(): string {
        return 'Portal Theme Plugin Loader';
    }

    generateMinimumConfig(plugin: MashroomPlugin) {
        return {};
    }

    async load(plugin: MashroomPlugin, config: MashroomPluginConfig, contextHolder: MashroomPluginContextHolder) {

        const themeBootstrap: MashroomPortalThemePluginBootstrapFunction = plugin.requireBootstrap();
        const {engineName, engineFactory} = await themeBootstrap(plugin.name, config, contextHolder);

        let resourcesRootPath = plugin.pluginDefinition.resourcesRoot;
        if (!resourcesRootPath) {
            resourcesRootPath = './dist';
        }
        if (resourcesRootPath.startsWith('.')) {
            resourcesRootPath = path.resolve(plugin.pluginPackage.pluginPackagePath, resourcesRootPath);
        }

        let viewsPath = plugin.pluginDefinition.views;
        if (!viewsPath) {
            viewsPath = './views';
        }
        if (viewsPath.startsWith('.')) {
            viewsPath = path.resolve(plugin.pluginPackage.pluginPackagePath, viewsPath);
        }

        const theme: MashroomPortalTheme = {
            name: plugin.name,
            description: plugin.description,
            lastReloadTs: Date.now(),
            engineName,
            requireEngine: () => engineFactory(),
            resourcesRootPath,
            viewsPath,
        };

        this._log.info('Registering theme:', {theme});
        this._registry.registerTheme(theme);
    }

    async unload(plugin: MashroomPlugin) {
        this._log.info(`Unregistering theme: ${plugin.name}`);
        this._registry.unregisterTheme(plugin.name);
    }
}
