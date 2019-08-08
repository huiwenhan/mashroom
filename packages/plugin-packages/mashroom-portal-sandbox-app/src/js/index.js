// @flow

import '../sass/style.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import SandboxApp from './components/SandboxApp';

import type {MashroomPortalAppPluginBootstrapFunction} from '@mashroom/mashroom-portal/type-definitions';

const bootstrap: MashroomPortalAppPluginBootstrapFunction = (portalAppHostElement, portalAppSetup, clientServices) => {
    const { lang } = portalAppSetup;
    const { portalAppService, stateService } = clientServices;

    ReactDOM.render(<SandboxApp lang={lang} portalAppService={portalAppService} portalStateService={stateService} />, portalAppHostElement);

    return {
        willBeRemoved: () => {
            ReactDOM.unmountComponentAtNode(portalAppHostElement)
        }
    };
};

global.startSandboxApp = bootstrap;
