// @flow

import React, {PureComponent} from 'react';
import {IntlProvider, addLocaleData} from 'react-intl';
import SpaceXLaunches from './SpaceXLaunches';
import messages from '../messages/messages';
import localeEn from 'react-intl/locale-data/en';
import localeDe from 'react-intl/locale-data/de';

addLocaleData([...localeEn, ...localeDe]);

type Props = {
    lang: string,
    spaceXApiPath: string,
}

type State = {
    loading: boolean,
    errorLoading: boolean,
    launches: ?any
}

export default class App extends PureComponent<Props, State> {

    pingReceiver: () => void;

    constructor() {
        super();
        this.state = {
            loading: false,
            errorLoading: false,
            launches: null,
        };
    }

    render() {
        let lang = this.props.lang;
        if (!messages[lang]) {
            lang = 'en';
        }

        return (
            <IntlProvider messages={messages[lang]} locale={lang}>
                <div className='mashroom-demo-rest-proxy-app'>
                    <SpaceXLaunches spaceXApiPath={this.props.spaceXApiPath}/>
                </div>
            </IntlProvider>
        );
    }

}
