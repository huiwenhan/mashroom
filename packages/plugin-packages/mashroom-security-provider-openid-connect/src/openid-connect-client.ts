
import {Client, custom, Issuer} from 'openid-client';

import type {ExpressRequest, MashroomLogger} from '@mashroom/mashroom/type-definitions';
import type {ClientConfiguration} from '../type-definitions';

let _clientConfiguration: ClientConfiguration | undefined;
let _client: Client | undefined;

export const setClientConfiguration = (clientConfiguration: ClientConfiguration) => {
    _clientConfiguration = clientConfiguration;
    _client = undefined;
};

export default async (request: ExpressRequest): Promise<Client | undefined> => {
    const logger: MashroomLogger = request.pluginContext.loggerFactory('mashroom.security.provider.openid.connect');

    if (_client) {
        return _client;
    }
    if (!_clientConfiguration) {
        logger.error('Cannot create OpenID Connect client because no configuration given!');
        return undefined;
    }

    const {issuerDiscoveryUrl, issuerMetadata, clientId, clientSecret, redirectUrl, responseType} = _clientConfiguration;
    if (!issuerDiscoveryUrl && !issuerMetadata) {
        logger.error('Cannot create OpenID Connect client because no discoverUrl and no metadata given!');
        return undefined;
    }

    custom.setHttpOptionsDefaults({
        rejectUnauthorized: _clientConfiguration.rejectUnauthorized,
    });

    let issuer;
    if (issuerDiscoveryUrl) {
        try {

            logger.info(`Setting up OpenID Connect with clientId=${clientId}, responseType=${responseType}, redirectUrl=${redirectUrl}, discoveryUrl=${issuerDiscoveryUrl}`);
            issuer = await Issuer.discover(issuerDiscoveryUrl);

        } catch (e) {
            logger.error(`Connection to service discovery url failed: ${issuerDiscoveryUrl}`, e);
            return undefined;
        }
    } else if (issuerMetadata) {
        logger.info(`Setting up OpenID Connect with clientId=${clientId}, responseType=${responseType}, redirectUrl=${redirectUrl}, metadata=${issuerMetadata}`);
        issuer = new Issuer(issuerMetadata);
    }
    if (!issuer) {
        return undefined;
    }

    logger.info('Issuer data:', issuer.metadata);

    if (Array.isArray(issuer.metadata.response_types_supported)) {
        const supportedResponseTypes: Array<string> = issuer.metadata.response_types_supported;
        if (supportedResponseTypes.indexOf(responseType) === -1) {
            logger.error(`Response type ${responseType} not supported! Supported are: ${supportedResponseTypes}`);
            return undefined;
        }
    }

    let client;
    try {
        client = new issuer.Client({
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uris: [redirectUrl],
            response_types: [responseType],
        });
    } catch (e) {
        logger.error('Client creation failed!', e);
        return undefined;
    }

    _client = client;
    return client;
}
