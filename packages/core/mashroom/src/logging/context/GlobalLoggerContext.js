// @flow

import type {MashroomLoggerContext} from '../../../type-definitions';

export default class GlobalLoggerContext implements MashroomLoggerContext {

    _context: {};

    constructor(context?: {}) {
        this._context = context || {};
    }

    add(context: {}) {
        this._context = {...this._context, ...context};
    }

    get() {
        return this._context;
    }

    clone() {
        return new GlobalLoggerContext({...this._context});
    }
}
