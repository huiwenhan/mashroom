// @flow

import React, {PureComponent} from 'react';
import {FormattedMessage} from 'react-intl';
import {CircularProgress, ErrorMessage, escapeForRegExp, escapeForHtml} from '@mashroom/mashroom-portal-ui-commons';

import type {Node} from 'react';
import type {AvailableApps} from '../../../type-definitions';
import type {MashroomAvailablePortalApp} from '@mashroom/mashroom-portal/type-definitions';

type AppsGroupedByCategory = Array<{
    category: string,
    apps: Array<MashroomAvailablePortalApp>
}>

type FilterTokens = {
    anyMatch: Array<RegExp>,
    fullMatch: Array<RegExp>,
}

type Props = {
    availableApps: AvailableApps,
    onDragStart: ?(event: DragEvent, name: string) => void,
    onDragEnd: ?() => void,
    filter?: ?string
};

const CATEGORY_NONE = 'ZZZ';
const CATEGORY_HIDDEN = 'hidden';

export default class AvailableAppsPanel extends PureComponent<Props> {

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

    onDragStart(event: DragEvent, name: string) {
        console.info('Drag start: ', name);
        if (this.props.onDragStart) {
            this.props.onDragStart(event, name);
        }
    }

    onDragEnd() {
        if (this.props.onDragEnd) {
            this.props.onDragEnd();
        }
    }

    getFilterTokens(): FilterTokens {
        if (!this.props.filter) {
            return {
                anyMatch: [],
                fullMatch: []
            };
        }
        const plainTokens = this.props.filter
            .split(' ')
            .filter((t) => t !== '')
            .map((t) => escapeForRegExp(t));
        return {
            anyMatch: plainTokens.map((t) => new RegExp(`(${t})`, 'ig')),
            fullMatch: plainTokens.map((t) => new RegExp(`^${t}$`, 'ig'))
        };
    }

    getAppsFilteredAndGroupedByCategory(tokens: FilterTokens): AppsGroupedByCategory {
        const availableApps = this.props.availableApps.apps;
        if (!availableApps || !Array.isArray(availableApps)) {
            return [];
        }

        const matches = (app: MashroomAvailablePortalApp) => {
            if (tokens.anyMatch.length === 0) {
                return true;
            }
            if (tokens.anyMatch.every((matcher) => app.name.match(matcher) || (app.description && app.description.match(matcher)))) {
                return true;
            }
            if (app.tags && tokens.fullMatch.some((matcher) => app.tags.find((tag) => tag.match(matcher)))) {
                return true;
            }
            return false;
        };

        const filteredAndGroupedByCategory: AppsGroupedByCategory = [];
        availableApps.forEach((app) => {
            const category = app.category || CATEGORY_NONE;
            if (category !== CATEGORY_HIDDEN && matches(app)) {
                const existingGroup = filteredAndGroupedByCategory.find((g) => g.category === category);
                if (existingGroup) {
                    existingGroup.apps.push(app);
                } else {
                    filteredAndGroupedByCategory.push({
                        category,
                        apps: [app]
                    });
                }
            }
        });

        // Sort by category
        filteredAndGroupedByCategory.sort((g1, g2) => g1.category.localeCompare(g2.category));

        return filteredAndGroupedByCategory;
    }

    renderCategoryApps(apps: Array<MashroomAvailablePortalApp>, tokens: FilterTokens): Array<Node> {
        const filterReplacement = '<span class="filter-match">$1</span>';

        return apps.map((app) => {
            let appName = escapeForHtml(app.name);
            let description = escapeForHtml(app.description || '');
            tokens.anyMatch.forEach((matcher) => {
                appName = appName.replace(matcher, filterReplacement);
                description = description.replace(matcher, filterReplacement);
            });

            return (
                <div key={app.name} className='available-app' onDragStart={(e) => this.onDragStart(e, app.name)} onDragEnd={this.onDragEnd.bind(this)} draggable>
                    <div className='app-name' dangerouslySetInnerHTML={{ __html: appName }}/>
                    <div className='app-description' dangerouslySetInnerHTML={{ __html: description }}/>
                </div>
            );
        });
    }

    renderAvailableApps() {
        const tokens = this.getFilterTokens();
        const filteredAndGroupedByCategory = this.getAppsFilteredAndGroupedByCategory(tokens);

        const groupedApps = [];

        filteredAndGroupedByCategory.forEach((group) => {
            const { category, apps } = group;
            groupedApps.push(
                <div key={category} className='grouped-apps'>
                    <div className='app-category'>
                        {category !== CATEGORY_NONE ? <span>{category}</span> : <FormattedMessage id='uncategorized'/>}
                    </div>
                    {this.renderCategoryApps(apps, tokens)}
                </div>
            );
        });

        return (
            <div className='available-app-list-wrapper'>
                {groupedApps}
            </div>
        );
    }

    render() {
        let content = null;
        if (this.props.availableApps.loading) {
            content = this.renderLoading();
        } else if (this.props.availableApps.error || !this.props.availableApps.apps) {
            content = this.renderError();
        } else {
            content = this.renderAvailableApps();
        }

        return (
           <div className='available-apps-panel'>
               {content}
           </div>
        );
    }
}
