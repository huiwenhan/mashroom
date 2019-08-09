// @flow

import React, {PureComponent} from 'react';
import {FormattedMessage} from 'react-intl';
import {CircularProgress, DropdownMenu, ErrorMessage} from '@mashroom/mashroom-portal-ui-commons';
import {DIALOG_NAME_SITE_CONFIGURE, DIALOG_NAME_SITE_DELETE} from '../constants';

import type {
    MashroomPortalAdminService,
    MashroomPortalSiteLinkLocalized
} from '@mashroom/mashroom-portal/type-definitions';
import type {DataLoadingService, Sites} from '../../../type-definitions';

type Props = {
    sites: Sites,
    dataLoadingService: DataLoadingService,
    portalAdminService: MashroomPortalAdminService,
    showModal: (name: string) => void,
    initConfigureSite: (siteId: string) => void
};

export default class SitesDropdownMenu extends PureComponent<Props> {

    closeDropDownRef: () => void;

    onOpen() {
        this.props.dataLoadingService.loadSiteLinks();
    }

    onGoto(site: MashroomPortalSiteLinkLocalized) {
        setTimeout(() => {
            window.location = site.url;
        }, 0);
    }

    onConfigure(site: MashroomPortalSiteLinkLocalized) {
        this.closeDropDownRef();
        this.props.initConfigureSite(site.siteId);
        this.props.showModal(DIALOG_NAME_SITE_CONFIGURE);
    }

    onDelete(site: MashroomPortalSiteLinkLocalized) {
        this.closeDropDownRef();
        this.props.initConfigureSite(site.siteId);
        this.props.showModal(DIALOG_NAME_SITE_DELETE);
    }

    renderLoading() {
        return (
            <CircularProgress/>
        );
    }

    renderError() {
        return (
            <ErrorMessage messageId='loadingFailed' />
        );
    }

    renderContent() {
        if (this.props.sites.loading) {
            return this.renderLoading();
        } else if (this.props.sites.error || !this.props.sites.sites) {
            return this.renderError();
        }

        const items = this.props.sites.sites.map((site) => (
            <div key={site.siteId} className='site'>
                <a className='site-link' href='javascript:void(0)' onClick={this.onGoto.bind(this, site)}>{site.title}</a>
                <div className='configure' onClick={this.onConfigure.bind(this, site)}>&nbsp;</div>
                <div className='delete' onClick={this.onDelete.bind(this, site)}>&nbsp;</div>
            </div>
        ));

        return (
            <div className='sites'>
                {items}
            </div>
        );
    }

    render() {
        return (
            <DropdownMenu className='sites-dropdown-menu' labelId='sites' onOpen={this.onOpen.bind(this)} closeRef={(ref) => this.closeDropDownRef = ref}>
                {this.renderContent()}
            </DropdownMenu>
        );
    }
}
