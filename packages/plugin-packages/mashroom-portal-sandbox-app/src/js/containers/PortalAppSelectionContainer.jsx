// @flow

import React from 'react';
import {connect} from 'react-redux';
import PortalAppSelection from '../components/PortalAppSelection';

import type {ComponentType} from 'react';
import type {
    Dispatch,
    State
} from '../../../type-definitions';
import type {MashroomAvailablePortalApp} from '@mashroom/mashroom-portal/type-definitions';

type OwnProps = {
    preselectAppName: ?string,
    onSelectionChanged: (?string) => void,
}

type StateProps = {|
    availablePortalApps: Array<MashroomAvailablePortalApp>,
    appLoadingError: boolean,
|}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
    return {
        availablePortalApps: state.availablePortalApps,
        appLoadingError: state.appLoadingError
    };
};

export default (connect(mapStateToProps)(PortalAppSelection): ComponentType<OwnProps>);
