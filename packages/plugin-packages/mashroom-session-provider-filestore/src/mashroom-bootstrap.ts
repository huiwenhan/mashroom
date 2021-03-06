
import sessionFileStore from 'session-file-store';

import type {Options} from 'session-file-store';

import type {MashroomSessionStoreProviderPluginBootstrapFunction} from '@mashroom/mashroom-session/type-definitions';

const bootstrap: MashroomSessionStoreProviderPluginBootstrapFunction = async (pluginName, pluginConfig, pluginContextHolder, expressSession) => {
    const logger = pluginContextHolder.getPluginContext().loggerFactory('mashroom.session.provider.filestore');
    logger.info('Using file session store options:', pluginConfig);

    const options: Options = {
        ...pluginConfig,
        logFn: (msg: any): void => {
            logger.info('File store message:', msg);
        }
    };
    const FileStore = sessionFileStore(expressSession);

    return new FileStore(options);
};

export default bootstrap;
