// @flow

import MashroomPlugin from '../../src/plugins/MashroomPlugin';
import {dummyLoggerFactory} from '@mashroom/mashroom-utils/lib/logging_utils';

import type {MashroomPluginDefinition} from '../../type-definitions';

const RegistryConnectorMock: any = jest.fn(() => ({
    on: () => {},
}));

describe('MashroomPlugin', () => {

    it('processes the plugin definition correctly', () => {

        const pluginPackage: any = {};
        const pluginDefinition: MashroomPluginDefinition = {
            name: 'Plugin 1',
            type: 'web-app',
            description: 'this is the description',
            tags: ['tag1', 'tag2'],
            bootstrap: './dist/mashroom-bootstrap.js',
            defaultConfig: {
                foo: 'bar',
            }
        };

        const plugin = new MashroomPlugin(pluginDefinition, pluginPackage, new RegistryConnectorMock(), dummyLoggerFactory);

        expect(plugin.name).toBe('Plugin 1');
        expect(plugin.type).toBe('web-app');
        expect(plugin.description).toBe('this is the description');
        expect(plugin.tags).toEqual(['tag1', 'tag2']);
        expect(plugin.status).toBe('pending');
    });

});
