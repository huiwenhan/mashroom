// @flow

import defaultRequestContext from './default_request_context';

import type {MashroomLoggerContext} from '../../../type-definitions';

const MASHROOM_LOGGER_CONTEXT_KEY = 'mashroomLoggerContext';

export default class RequestLoggerContext implements MashroomLoggerContext {

    _request: any;

    constructor(req: http$IncomingMessage<>) {
        this._request = req;
        this.add(defaultRequestContext(req));
    }

    add(context: {}) {
        const existingContext = this._request[MASHROOM_LOGGER_CONTEXT_KEY] || {};
        this._request[MASHROOM_LOGGER_CONTEXT_KEY] = {...existingContext, ...context};
    }

    get() {
        return this._request[MASHROOM_LOGGER_CONTEXT_KEY] || {};
    }

    clone() {
        // Since the logger is bound to the request
        // there is no point in actually creating a new instance
        return this;
    }

}
