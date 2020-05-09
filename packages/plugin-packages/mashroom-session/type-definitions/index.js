// @flow

import type {MashroomPluginConfig, MashroomPluginContextHolder} from '@mashroom/mashroom/type-definitions';
import type {ExpressRequest} from '@mashroom/mashroom/type-definitions';

export type MashroomSessionStoreProvider = any;

/**
 * Bootstrap method definition for security-provider plugins
 */
export type MashroomSessionStoreProviderPluginBootstrapFunction = (pluginName: string, pluginConfig: MashroomPluginConfig, contextHolder: MashroomPluginContextHolder, expressSession: any) => Promise<MashroomSessionStoreProvider>;

export interface MashroomSessionService {
    /**
     * Get the current session count (if the store supports this).
     */
    getSessionCount(req: ExpressRequest): Promise<?number>;

    /**
     * Clear all sessions (if the store supports this).
     */
    clearSessions(req: ExpressRequest): Promise<void>;
}
