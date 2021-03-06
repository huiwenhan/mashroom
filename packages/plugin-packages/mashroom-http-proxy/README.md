
# Mashroom HTTP proxy

Plugin for [Mashroom Server](https://www.mashroom-server.com), a **Integration Platform for Microfrontends**.

Adds a service for forwarding requests to a target URI.

## Usage

If *node_modules/@mashroom* is configured as plugin path just add **@mashroom/mashroom-http-proxy** as *dependency*.

After that you can use the service like this:

```js
// @flow

import type {MashroomHttpProxyService} from '@mashroom/mashroom-http-proxy/type-definitions';

export default async (req: ExpressRequest, res: ExpressResponse) => {
    const httpProxyService: MashroomHttpProxyService = req.pluginContext.services.proxy.service;

    const targetURI = 'http://foo.bar/api/test';
    const additionalHeaders = {};
    await httpProxyService.forward(req, res, targetURI, additionalHeaders);
}
```

You can override the default config in your Mashroom config file like this:

```json
{
    "plugins": {
        "Mashroom Http Proxy Services": {
            "forwardMethods": [
                "GET",
                "POST",
                "PUT",
                "DELETE"
            ],
            "forwardHeaders": [
              "accept",
              "accept-*",
              "range",
              "expires",
              "cache-control",
              "last-modified",
              "content-*",
              "uber-trace-id",
              "uberctx-",
              "b3",
              "x-b3-*",
              "trace*"
            ],
            "rejectUnauthorized": true,
            "poolMaxSockets": 10,
            "socketTimeoutMs": 60000
        }
    }
}
```
 * _forwardMethods_: The methods that should be forwarded
 * _forwardHeaders_: The http headers that should be forwarded. May contain a _*_ as wildcard.
 * _rejectUnauthorized_: Reject self-signed certificates (Default: true)
 * _poolMaxSockets_: Max pool size for connections (Default: 10)
 * _socketTimeoutMs_: Socket timeout, 0 means no timeout (Default: 30000 - 30sec)

## Services

### MashroomHttpProxyService

The exposed service is accessible through _pluginContext.services.proxy.service_

**Interface:**

```js
export interface MashroomHttpProxyService {

    /**
     * Forwards the given request to the targetUri and passes the response from the target to the response object.
     * The Promise will always resolve, you have to check response.statusCode to see if the transfer was successful or not.
     * The Promise will resolve as soon as the whole response was sent to the client.
     */
    forward(req: ExpressRequest, res: ExpressResponse, targetUri: string, additionalHeaders?: HttpHeaders): Promise<void>;
}
```

