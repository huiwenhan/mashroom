
# Change Log

## [unreleased]

 * Portal: Call the *willBeRemoved* lifecycle hook of all apps on page unload; this gives the app a chance to do some
   cleanup or persist its state properly
 * Portal: Made *defaultTheme* and *defaultLayout* in the site configuration optional and derive it from
   the server configuration if not set

## 1.5.0 (June 14, 2020)

 * Sandbox: Added query parameter *sbPreselectAppName* to preselect an app without loading it
 * Added metrics for: Plugin count, Remote apps, Session count, HTTP proxy pool, WebSocket connections, Redis/MongoDB/MQTT/AMQP connection status
 * Added a plugin that exports the collected metrics for the _Prometheus_ monitoring system
 * Added a metrics collector plugin that adds request metrics and exposes a service for other plugins to add more metrics
 * MongoDB Storage Provider: Added the possibility pass connection properties such as pool size.
   **BREAKING CHANGE**: Renamed the _connectionUri_ property to _uri_.
 * Remote Portal App Registries: Added an option _socketTimeoutSec_ to configure the timeout when trying to access remote apps
 * Storage Service: Can now leverage the new Memory Cache Service to accelerate the access. Can be configured like this:
   ```json
   "Mashroom Storage Services": {
       "provider": "Mashroom Storage Filestore Provider",
       "memoryCache": {
           "enabled": true,
           "ttlSec": 120,
           "invalidateOnUpdate": true,
           "collections": {
               "mashroom-portal-pages": {
                  "ttlSec": 300
               }
           }
       }
   }
   ```
 * Added a Redis provider plugin for the Memory Cache
 * Added a general purpose Memory Cache Service with a built-in provider implementation based on *node-cache*
 * Login web-app: All query parameters in the *redirectUrl* are now preserved after login
 * Core: Added a new property *serverInfo.devMode* to the plugin context that can be used to determine if some packages are in development mode
 * Added a wrapper security provider that adds support for Basic authentication to any other security provider that implements _login()_ properly.
   Useful for end-2-end or load tests and if you want to access some API from an external system.
 * Core: Enable Express "view cache" when no plugin package is in *devMode*,
   even if NODE_ENV is not *production*.

## 1.4.5 (May 5, 2020)

 * Security: A valid response object will now be passed to security providers during a silent login
   (when canAuthenticateWithoutUserInteraction() is true). It was not possible to set cookies.
 * OIDC Security Provider: Fixed *rejectUnauthorized* - didn't work as expected

## 1.4.4 (May 4, 2020)

 * Upgraded libraries with known vulnerabilities
 * Default Login Webapp: Renamed the redirect query parameter to *redirectUrl*
 * Portal: The logout route accepts now a *redirectUrl* parameter with the page that should be redirected to after revoking the authentication
   (default is still the Site's index page)

## 1.4.3 (May 2, 2020)

 * Portal: Keep query parameters when redirecting to default site
 * OIDC Security Provider: Added a *rejectUnauthorized* config property for Identity Providers with self-signed certificates
 * Portal: Fixed mapping of email property in the *portalAppSetup*

## 1.4.2 (April 25, 2020)

 * Security Provider: Added new method *getApiSecurityHeaders(req, targetUri)* that allows it to add security headers to backend/API calls.
   Useful to add extra user context or access tokens to backend requests.
 * Portal: Removed the REST proxy property *sendRoles* because the concept of permissions should be used in backends as well.
 * Portal: If the REST proxy property *sendUserHeaders* is true the following headers will be sent additionally with each REST request:
     * X-USER-DISPLAY-NAME
     * X-USER-EMAIL
 * Portal: Fixed mapping *Sites* to virtual hosts when the frontend base path is /
 * Virtual host path mapper: Added a config property to explicitly set the http headers that
   should be considered (default is *x-forwarded-host*) to determine the actual host

## 1.4.1 (April 20, 2020)

 * Added a virtual host path mapper plugin: Allows it to map internal paths based on virtual hosts and web apps to get
   the actual "frontend path" to generate absolute links at the same time.
   Can be used to expose Portal *Sites* to virtual hosts like so:

   https://www.my-company.com/new-portal -> http://internal-portal-host/portal/web

   For this example configure your reverse proxy to forward calls from *https://www.my-company.com/public* to *http://internal-portal-host/* and
   additionally configure the new plugin like this:

   ```json
   "Mashroom VHost Path Mapper Middleware": {
     "hosts": {
       "www.my-company.com": {
         "frontendBasePath": "/new-portal",
           "mapping": {
             "/login": "/login",
             "/": "/portal/web"
           }
        }
     }
   }
   ```

## 1.4.0 (April 6, 2020)

 * Portal: The *sites* work now completely independent (all URLs are relative to <portal_path>/<site_path>).
   That means in particular you can have both public sites and private (protected) sites at the same time with an ACL configuration like this:
     ```json
       {
         "/portal/public-site/**": {
           "*": {
             "allow": "any"
           }
       }
       "/portal/**": {
         "*": {
           "allow": {
             "roles": ["Authenticated"]
           }
         }
       }
     }
     ```
 * Security: Extended the ACL rules:
   * "any" is now a possible value for allow/deny; this matches also anonymous users which is useful for public sub-pages
   * it is now possible to pass an object to allow/deny with a list of roles and ip addresses
    ```json
    {
      "/portal/**": {
        "*": {
          "allow": {
            "roles": ["Authenticated"],
            "ips": ["10.1.2.*", "168.**"]
          },
          "deny": {
            "ips": ["1.2.3.4"]
          }
        }
      }
    }
    ```
 * Security: Added a new method *canAuthenticateWithoutUserInteraction()* to the Security Provider interface that allows it
   to check if a user could be logged in silently on public pages, which could be desirable
 * Security: Added a new config property to the *mashroom-security* plugin that allows to forward specific query parameters
   to the authorization system (e.g. a hint which identity provider to use):
    ```
    "Mashroom Security Services": {
       "provider": "Mashroom Security Simple Provider",
       "forwardQueryHintsToProvider": ["kc_idp_hint"]
    }
    ```
 * Portal: Fixed anonymous access to pages
 * Added OpenID Connect security provider
 * Angular Demo Portal App: Works now with AOP and the Ivy Compiler
 * External MQTT Messaging Provider: Supports now MQTT 5
 * Removed support for Node 8
 * Added MongoDB storage provider
 * Security: The middleware regenerates the session now before and after a login instead of destroying it.
   Because session.destroy() removes the request.session property completely but some security provider might need a session during authentication.

## 1.3.2 (February 22, 2020)

 * File Storage: Locking works now also on NFS correctly
 * Removed log statements that could expose passwords

## 1.3.1 (February 8, 2020)

 * Remote App Registry Kubernetes: Show all Kubernetes services matching the pattern and a proper error message if no portal apps could be found.
   Remove portal apps after some time if the Kubernetes services disappeared.
 * Remote App Registry: Added plugin config property to hide the *Add a new Remote Portal App Endpoint* form from the Admin UI
 * Remote App Registry: Moved config properties from the *Mashroom Portal Remote App Registry Webapp* plugin to the
   *Mashroom Portal Remote App Registry* plugin where it belongs (**BREAKING CHANGE**)

## 1.3.0 (January 27, 2020)

 * Portal: Fixed broken IE11 support
 * Portal: Admin Toolbar cleanup and small fixes
 * Added support for messaging via AMQP (Advanced Messaging Queuing) protocol, supported by almost all message brokers
   (RabbitMQ, Qpid, ActiveMQ, Artemis, Azure Service Bus, ...)
 * Added Remote Portal App registry that automatically scans Kubernetes namespaces for apps
 * Tabify App: The tab buttons have now a new attribute (*data-app-ref*) that contains the id of the corresponding app wrapper div.
   This is useful for end-2-end tests to determine if an app is visible.
 * Sandbox App: Fixed loading of portal apps with bootstrap methods that don't return anything
 * Core: Made it possible to use environment variables in server and plugin configuration. If the config value is a valid
   [template string](https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/template_strings) it gets evaluated and the
   environment variables are accessible through the *env* object. Example:
    ```json
    {
        "name": "${env.USER}'s Mashroom Server",
        "port": 5050
    }
    ```
 * Added TypeScript definitions for all API's. Works now similar than with flow:
   ```js
     // index.ts
     import {MashroomPortalAppPluginBootstrapFunction} from '@mashroom/mashroom-portal/type-definitions';
     const bootstrap: MashroomPortalAppPluginBootstrapFunction = (hostElement, portalAppSetup, portalClientServices) => {
       // ...
     }
   ```

## 1.2.3 (January 11, 2020)

 * Core: Added health checks that can for example be used as readiness/liveness probes in Kubernetes (*/mashroom/health*)
 * Core: Moved Admin UI from */mashroom* to */mashroom/admin*
 * Svelte based demo Portal App added
 * Sandbox App: Loads now also shared resources properly
 * Portal: When a portal app gets unloaded all its message bus listeners will automatically be unregistered
   (in case the app does not unregister the listeners properly on onmount)

## 1.2.2 (December 7, 2019)

* Forward query parameters to the index page
* Upgraded some dependencies because of security vulnerabilities

## 1.2.1 (November 25, 2019)

 * Redis Session Provider: Added cluster support
 * Session Middleware: Log error messages of providers (Redis, MongoDB) properly

## 1.2.0 (November 15, 2019)

 * Portal: The Angular 8 demo App can now be loaded multiple times on the same page with a different
   configuration (bootstrap fixed).
 * Portal: Added support for sharing resources between portal apps (e.g. vendor libraries or styles).
   A shared resource with a given name will only loaded once, even if multiple Portal Apps declare it.
   A shared resource can be added like this in the plugin definition:
    ```json
    {
        "name": "Demo Shared DLL App 1",
        "type": "portal-app",
        "bootstrap": "startupDemoSharedDLLApp1",
        "sharedResources": {
            "js": [
                "demo_shared_dll_910502a6fce2f139eff8.js"
            ]
        }
    }
    ```
   Check out the demo project here: https://github.com/nonblocking/mashroom-demo-shared-dll
 * Portal: A remote Portal App which is not reachable for a long time is now unregistered instead of complete removed from the
   list of remote Apps
 * Added MongoDB session provider plugin
 * Added Redis session provider plugin
 * Portal: Show a proper error if a configured Portal App on a page cannot be loaded (instead of showing nothing)

## 1.1.4 (October 23, 2019)

 * Core: Logger instances created via _req.pluginContext.loggerFactory('category')_ share now the context with all other loggers created
   from the same request. This can for example be used to output tracing information with each log entry.
   The following context properties will be added automatically to each request:
    * _clientIP_
    * _browser_ (e.g. Chrome, Firefox)
    * _browserVersion_
    * _os_ (e.g. Windows)
    * _sessionID_ (if a session is available)
    * _portalAppName_ (if the request is related to a portal app)
    * _portalAppVersion_ (if the request is related to a portal app)
   To add additional properties to the logger context use the new _logger.addContext()_ method (e.g. within a middleware).
   If you want to output context properties with the log entries you could configure the _log4js_ appender like this:
    ```
    "console": {
        "type": "console",
        "layout": {
            "type": "pattern",
            "pattern": "%d %p %X{sessionID} %X{browser} %X{browserVersion} %X{username} %X{portalAppName} %X{portalAppVersion} %c - %m"
        }
    }
    ```
 * HTTP Proxy: White listed _Jaeger_, _OpenZipkin_ and W3C Trace Context HTTP headers by default
 * HTTP Proxy: Fixed the problem that all requests headers got forwarded to the target, even _cookie_ and other security relevant ones

## 1.1.3 (October 15, 2019)

 * Tabify App: Allow to update the title for a specific app id. This is useful for dynamic cockpits where you might
   want to load the same App multiple times in a tabbed area.
 * Portal: Fixed a problem with token highlighting in the add app panel

## 1.1.2 (September 30, 2019)

 * Added a middleware plugin that introduces [Helmet](https://helmetjs.github.io) which sets a bunch of protective
   HTTP headers on each response
 * Upgraded some dependencies because of security vulnerabilities

## 1.1.1 (September 26, 2019)

 * WebSocket server now sends keep alive messages to prevent reverse proxies and firewalls from closing the connection
 * Portal: _MashroomMessageBus.getRemoteUserPrivateTopic()_ takes now an optional argument _username_ if you want to obtain the private
   topic of a particular user instead of the "own" (the private topic of the authenticated user)

## 1.1.0 (September 19, 2019)

 * Portal: Added two new (optional) security related properties to the default config of portal apps:
     * _defaultRestrictViewToRoles_: Same as the previous _defaultRestrictedToRoles_ but renamed to make its purpose clearer.
       These roles can be overwritten via Admin App per App instance in the UI.
     * _restProxy.restrictToRoles_: If this is set only users with one of the given roles can access the rest proxy.
       In contrast to all other permissions the _Administrator_ role has _not_ automatically access.
 * Added a provider plugin to support MQTT as external messaging system
 * Added a demo portal app to demonstrate remote messaging
 * Portal: Added support for remote messaging. Portal apps can now subscribe to server side topics (prefixed with :remote)
   and communicate with apps on other pages and browser tabs. If the service side messaging is connected to an external
   messaging system (e.g. MQTT) it is also possible to subscribe and publish messages to the external system.
 * Added a Service plugin for server-side messaging that comes with a WebSocket interface which allows sending messages
   across clients (and browser tabs). Furthermore it be connected to an external messaging system (such as MQTT) via provider plugin.
 * Core: Added the possibility to listen on Plugin load and unload events via _MashroomPluginService_.
   Useful if you want to cleanup when your plugin unloads or in the rare case where you have to hold
   a plugin instance and want to get notified about an unload or reload.
 * Added a Service plugin to handle WebSocket connections (_mashroom-websocket_)
 * Core: web-app Plugins can now additionally have handlers for upgrade requests (WebSocket support) and for unload
 * Core: The _Middleware_ tab in the Admin UI shows now the actual order of the stack (until now the order was just calculated)

## 1.0.94 (August 28, 2019)

 * Portal: Made it configurable when the Portal will start to warn that the authentication is about to expire
 * Renamed _MashroomSecurityProvider.refreshAuthentication()_ to _checkAuthentication()_

## 1.0.93 (August 27, 2019)

 * Portal: Added configuration property to automatically extend the authentication (so it stays valid as long as the browser page is opened)
 * Portal: Removed the "auto-logout" feature, instead the Portal warns now when the authentication is about to expire.
 * Decoupled authentication from session, in particular the authentication expiration. This simplifies the implementation for
   providers like OAuth2. **BREAKING CHANGE**: The _MashroomSecurityProvider_ interface has been extended.

## 1.0.92 (August 12, 2019)

 * Portal: The app filter in Portal Admin Toolbar considers now _tags_ also.
   And the categories are sorted alphabetically now.
 * Portal: All initial query parameters are now added again after login

## 1.0.91 (August 9, 2019)

 * Core: Added optional _tags_ (array) property to the plugin definition
 * Bunch of small default theme improvements
 * Common UI library: Highlight input fields with validation errors
 * Portal: Added a Sandbox App to test Portal Apps.
   It allows it to load any Portal App with a specific configuration and to interact with the App
   via Message Bus. Can also be used for end-2-end testing with tools such as Selenium.

## 1.0.90 (July 18, 2019)

First public release
