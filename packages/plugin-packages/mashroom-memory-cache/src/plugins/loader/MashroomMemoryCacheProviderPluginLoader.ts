

import type {
    MashroomPluginLoader,
    MashroomPlugin,
    MashroomPluginConfig,
    MashroomPluginContextHolder,
    MashroomLogger,
    MashroomLoggerFactory
} from '@mashroom/mashroom/type-definitions';
import type {
    MashroomMemoryCacheProvider,
    MashroomMemoryCacheProviderPluginBootstrapFunction,
} from '../../../type-definitions';
import type {
    MashroomMemoryCacheProviderRegistry,
} from '../../../type-definitions/internal';

export default class MashroomMemoryCacheProviderPluginLoader implements MashroomPluginLoader {

    private logger: MashroomLogger;

    constructor(private registry: MashroomMemoryCacheProviderRegistry, private loggerFactory: MashroomLoggerFactory) {
        this.logger = loggerFactory('mashroom.session.memorycache.plugin.loader');
    }

    get name(): string {
        return 'Session Store Provider Plugin Loader';
    }

    generateMinimumConfig() {
        return {};
    }

    async load(plugin: MashroomPlugin, config: MashroomPluginConfig, contextHolder: MashroomPluginContextHolder) {
        const bootstrap: MashroomMemoryCacheProviderPluginBootstrapFunction = plugin.requireBootstrap();
        const provider: MashroomMemoryCacheProvider = await bootstrap(plugin.name, config, contextHolder);
        this.logger.info(`Registering memory cache provider plugin: ${plugin.name}`);
        this.registry.register(plugin.name, provider);
    }

    async unload(plugin: MashroomPlugin) {
        this.logger.info(`Unregistering memory cache provider plugin: ${plugin.name}`);
        this.registry.unregister(plugin.name);
    }
}
