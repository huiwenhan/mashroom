import {IdTokenClaims, IssuerMetadata, ResponseType, TokenSet, UserinfoResponse} from 'openid-client';
import {ExpressRequest} from '@mashroom/mashroom/type-definitions';

export type ExpressRequestWithSession = ExpressRequest & {
    session: any;
}

export type Mode = 'OIDC' | 'OAuth2';

export type ClientConfiguration = {
    issuerDiscoveryUrl: string | undefined | null;
    issuerMetadata: IssuerMetadata | undefined | null;
    clientId: string;
    clientSecret: string;
    redirectUrl: string;
    responseType: ResponseType;
}

export type CallbackConfiguration = {
    mode: Mode;
    rolesClaimName: string | undefined | null;
    adminRoles: Array<string>;
}

export type OpenIDConnectAuthData = {
    state?: string | undefined;
    nonce?: string | undefined;
    codeVerifier?: string | undefined;
    backUrl?: string | undefined;
    lastTokenCheck?: number | undefined;
    tokenSet?: TokenSet | undefined;
}
