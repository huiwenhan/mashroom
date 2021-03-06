// @flow

import React, {PureComponent} from 'react';
import {FormattedMessage} from 'react-intl';

import type {Node} from 'react';

type Props = {
    name: string,
    tabs: Array<{
        name: string,
        titleId: string,
        content: Node
    }>,
    activeTab?: string,
    setActiveTab: (name: string) => void,
    className?: string
}

export default class TabDialog extends PureComponent<Props> {

    getActiveTabIndex() {
        const activeTab = this.props.tabs.find((t) => t.name === this.props.activeTab);
        if (activeTab) {
            return this.props.tabs.indexOf(activeTab);
        }
        if (this.props.tabs.length > 0) {
            return 0;
        }

        return null;
    }

    onChangeActiveTab(name: string) {
        this.props.setActiveTab(name);
    }

    renderHeader() {
        const activeTabIndex = this.getActiveTabIndex();
        if (activeTabIndex === null) {
            return null;
        }

        const buttons = this.props.tabs.map((t, idx) => (
            <div key={t.name} className={`tab-dialog-button ${idx === activeTabIndex ? 'active' : ''}`} onClick={this.onChangeActiveTab.bind(this, t.name)}>
                <div className='title'><FormattedMessage id={t.titleId} /></div>
            </div>
        ));

        return (
            <div className='tab-dialog-header'>
                {buttons}
            </div>
        );
    }

    renderContent() {
        const activeTabIndex = this.getActiveTabIndex();
        if (activeTabIndex === null) {
            return null;
        }

        const content = this.props.tabs[activeTabIndex].content;

        return (
            <div className='tab-dialog-content'>
                {content}
            </div>
        );
    }

    render() {
        return (
            <div className='mashroom-portal-ui-tab-dialog'>
                {this.renderHeader()}
                {this.renderContent()}
            </div>
        );
    }

}

