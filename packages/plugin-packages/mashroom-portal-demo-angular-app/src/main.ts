import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app/app.module';

import {PortalAppSetup, PortalClientServices} from './types';

if (process.env.NODE_ENV === 'production') {
    enableProdMode();
}

let moduleCreated = false;

const bootstrap = (element: HTMLElement, portalAppSetup: PortalAppSetup, portalClientServices: PortalClientServices) => {
    if (moduleCreated) {
        return Promise.reject('Due to framework limitations an Angular module can only be created once on a page!');
    }

    element.innerHTML = `
        <angular-demo-app>
        </angular-demo-app>
    `;

    moduleCreated = true;

    return platformBrowserDynamic([
        {provide: 'app.setup', useValue: portalAppSetup},
        {provide: 'client.services', useValue: portalClientServices}
    ]).bootstrapModule(AppModule).then(
        (module) => {
            return {
                willBeRemoved: () => {
                    console.info('Destroying Angular module');
                    module.destroy();
                }
            };
        }
    );
};

window['startAngularDemoApp'] = bootstrap;
