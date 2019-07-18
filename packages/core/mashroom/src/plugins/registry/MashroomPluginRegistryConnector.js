// @flow

import EventEmitter from 'events';

import type {
    MashroomPluginRegistryConnectorEventName, MashroomPluginRegistryConnectorEvent, MashroomPluginRegistryConnector as MashroomPluginRegistryConnectorType,
} from '../../../type-definitions';

export default class MashroomPluginPackageRegistryConnector implements MashroomPluginRegistryConnectorType {

    _eventEmitter: EventEmitter;

    constructor() {
        this._eventEmitter = new EventEmitter();
    }

    on(eventName: MashroomPluginRegistryConnectorEventName, listener: MashroomPluginRegistryConnectorEvent => void) {
        this._eventEmitter.on(eventName, listener);
    }

    removeListener(eventName: MashroomPluginRegistryConnectorEventName, listener: MashroomPluginRegistryConnectorEvent => void): void {
        this._eventEmitter.removeListener(eventName, listener);
    }

    emitLoaded(event: MashroomPluginRegistryConnectorEvent) {
        this._eventEmitter.emit('loaded', event);
    }

    emitUpdated(event: MashroomPluginRegistryConnectorEvent) {
        this._eventEmitter.emit('updated', event);
    }

    emitError(event: MashroomPluginRegistryConnectorEvent) {
        this._eventEmitter.emit('error', event);
    }

}
