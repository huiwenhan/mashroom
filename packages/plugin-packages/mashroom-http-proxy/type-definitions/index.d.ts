/* eslint-disable */

import {ExpressRequest, ExpressResponse} from '@mashroom/mashroom/type-definitions';

// -------- Converted from api.js via https://flow-to-ts.netlify.com ----------

export type HttpHeaders = {
    [key: string]: string;
};

export interface MashroomHttpProxyService {
    /**
     * Forwards the given request to the targetUri and passes the response from the target to the response object.
     * The Promise will always resolve, you have to check response.statusCode to see if the transfer was successful or not.
     * The Promise will resolve as soon as the whole response was sent to the client.
     */
    forward(
        req: ExpressRequest,
        res: ExpressResponse,
        targetUri: string,
        additionalHeaders?: HttpHeaders,
    ): Promise<void>;
}
