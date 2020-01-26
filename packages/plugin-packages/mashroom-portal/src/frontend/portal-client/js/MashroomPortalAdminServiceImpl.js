// @flow
/* eslint no-unused-vars: off */

import {WINDOW_VAR_PORTAL_API_PATH, WINDOW_VAR_PORTAL_PAGE_ID, WINDOW_VAR_PORTAL_SITE_ID} from '../../../backend/constants';

import type {MashroomPluginConfig} from '@mashroom/mashroom/type-definitions';
import type {
    MashroomPortalAdminService,
    MashroomRestService,
    MashroomCreatePagePortalAppInstance,
    MashroomUpdatePagePortalAppInstance,
    MashroomPortalPage,
    MashroomPortalSite
} from '../../../../type-definitions';

export default class MashroomPortalAppServiceImpl implements MashroomPortalAdminService {

    _restService: MashroomRestService;

    constructor(restService: MashroomRestService) {
        const apiPath = global[WINDOW_VAR_PORTAL_API_PATH];
        this._restService = restService.withBasePath(apiPath);
    }

    getAvailableThemes() {
        const path = `/themes`;
        return this._restService.get(path);
    }

    getAvailableLayouts() {
        const path = `/layouts`;
        return this._restService.get(path);
    }

    getExistingRoles() {
        const path = `/roles`;
        return this._restService.get(path);
    }

    getAppInstances() {
        const pageId = this.getCurrentPageId();
        const path = `/pages/${pageId}/portal-app-instances`;
        return this._restService.get(path);
    }

    addAppInstance(pluginName: string, areaId: string, position?: number, appConfig?: MashroomPluginConfig) {
        const pageId = this.getCurrentPageId();
        const data: MashroomCreatePagePortalAppInstance = {
            pluginName,
            areaId,
            position,
            appConfig,
        };

        const path = `/pages/${pageId}/portal-app-instances`;
        return this._restService.post(path, data);
    }

    updateAppInstance(pluginName: string, instanceId: string, areaId: ?string, position: ?number, appConfig: ?MashroomPluginConfig) {
        const pageId = this.getCurrentPageId();
        const data: MashroomUpdatePagePortalAppInstance = {};
        if (areaId) {
            data.areaId = areaId;
        }
        if (typeof(position) === 'number') {
            data.position = position;
        }
        if (appConfig) {
            data.appConfig = appConfig;
        }

        const path = `/pages/${pageId}/portal-app-instances/${pluginName}/${instanceId}`;
        return this._restService.put(path, data);
    }

    removeAppInstance(pluginName: string, instanceId: string) {
        const pageId = this.getCurrentPageId();
        const path = `/pages/${pageId}/portal-app-instances/${pluginName}/${instanceId}`;
        return this._restService.delete(path);
    }

    getAppInstancePermittedRoles(pluginName: string, instanceId: string) {
        const pageId = this.getCurrentPageId();
        const path = `/pages/${pageId}/portal-app-instances/${pluginName}/${instanceId}/permittedRoles`;
        return this._restService.get(path);
    }

    updateAppInstancePermittedRoles(pluginName: string, instanceId: string, roles: ?string[]) {
        const pageId = this.getCurrentPageId();
        const path = `/pages/${pageId}/portal-app-instances/${pluginName}/${instanceId}/permittedRoles`;
        return this._restService.put(path, roles || []);
    }

    getCurrentPageId() {
        const pageId = window[WINDOW_VAR_PORTAL_PAGE_ID];
        if (!pageId) {
            throw new Error('Unable to determine the current pageId!');
        }
        return pageId;
    }

    getPage(pageId: string) {
        const path = `/pages/${pageId}`;
        return this._restService.get(path);
    }

    addPage(page: MashroomPortalPage) {
        const path = '/pages';
        return this._restService.post(path, page);
    }

    updatePage(page: MashroomPortalPage) {
        const path = `/pages/${page.pageId}`;
        return this._restService.put(path, page);
    }

    deletePage(pageId: string) {
        const path = `/pages/${pageId}`;
        return this._restService.delete(path);
    }

    getPagePermittedRoles(pageId: string) {
        const path = `/pages/${pageId}/permittedRoles`;
        return this._restService.get(path);
    }

    updatePagePermittedRoles(pageId: string, roles: ?string[]) {
        const path = `/pages/${pageId}/permittedRoles`;
        return this._restService.put(path, roles || []);
    }

    getCurrentSiteId() {
        const siteId = window[WINDOW_VAR_PORTAL_SITE_ID];
        if (!siteId) {
            throw new Error('Unable to determine the current siteId!');
        }
        return siteId;
    }

    getSite(siteId: string) {
        const path = `/sites/${siteId}`;
        return this._restService.get(path);
    }

    addSite(site: MashroomPortalSite) {
        const path = '/sites';
        return this._restService.post(path, site);
    }

    updateSite(site: MashroomPortalSite) {
        const path = `/sites/${site.siteId}`;
        return this._restService.put(path, site);
    }

    deleteSite(siteId: string) {
        const path = `/sites/${siteId}`;
        return this._restService.delete(path);
    }

    getSitePermittedRoles(siteId: string) {
        const path = `/sites/${siteId}/permittedRoles`;
        return this._restService.get(path);
    }

    updateSitePermittedRoles(siteId: string, roles: ?string[]) {
        const path = `/sites/${siteId}/permittedRoles`;
        return this._restService.put(path, roles || []);
    }
}
