
### Mashroom Session Redis Provider

Plugin for [Mashroom Server](https://www.mashroom-server.com), a **Integration Platform for Microfrontends**. 

This plugin adds a Redis session store that can be used by _Mashroom Session_.
Actually this is just a wrapper for the [connect-redis](https://github.com/tj/connect-redis) package.

#### Usage

If *node_modules/@mashroom* is configured as plugin path just add **@mashroom/mashroom-session-provider-redis** as *dependency*.

Activate this session provider in your Mashroom config file like this:

```json
{
  "plugins": {
        "Mashroom Session Redis Provider": {
            "provider": "Mashroom Session MongoDB Provider"
        }
    }
}
```

And to change the default config of this plugin add:

```json
{
  "plugins": {
        "Mashroom Session Redis Provider": {
           "host": "localhost",
           "port": "6379",
           "prefix": "mashroom:",
           "connect_timeout": 1000
        }
    }
}
```

All config options are directly passed to the Redis client. 
See the _redis.createClient()_ section on [session-file-store](https://github.com/NodeRedis/node_redis) for available options.
