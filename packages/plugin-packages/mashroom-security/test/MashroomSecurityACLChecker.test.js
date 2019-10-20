// @flow

import {dummyLoggerFactory as loggerFactory} from '@mashroom/mashroom-utils/lib/logging_utils';
import MashroomSecurityACLChecker from '../src/acl/MashroomSecurityACLChecker';
import type {MashroomSecurityUser} from '../type-definitions';

describe('MashroomSecurityACLChecker', () => {

    it('should not allow anonymous at a protected path', async () => {
        const aclPath = './test_acl.json';
        const aclChecker = new MashroomSecurityACLChecker(aclPath, __dirname, loggerFactory);
        const user: ?MashroomSecurityUser = null;

        const req: any = {
            path: '/portal',
            method: 'GET',
            pluginContext: {
                loggerFactory
            },
        };
        expect(await aclChecker.allowed(req, user)).toBeFalsy();

        const req2: any = {
            path: '/portal/foo/bar',
            method: 'GET',
            pluginContext: {
                loggerFactory
            },
        };
        expect(await aclChecker.allowed(req2, user)).toBeFalsy();

        const req3: any = {
            path: '/portal2',
            method: 'GET',
            pluginContext: {
                loggerFactory
            },
        };
        expect(await aclChecker.allowed(req3, user)).toBeFalsy();

        const req4: any = {
            path: '/portal2/',
            method: 'GET',
            pluginContext: {
                loggerFactory
            },
        };
        expect(await aclChecker.allowed(req4, user)).toBeFalsy();

        const req5: any = {
            path: '/a/b/bit/more/complicated',
            method: 'GET',
            pluginContext: {
                loggerFactory
            },
        };
        expect(await aclChecker.allowed(req5, user)).toBeFalsy();
    });

    it('should allow anonymous at a unprotected path', async () => {
        const aclPath = './test_acl.json';
        const aclChecker = new MashroomSecurityACLChecker(aclPath, __dirname, loggerFactory);
        const user: ?MashroomSecurityUser = null;

        const req: any = {
            path: '/help/foo/bar',
            method: 'GET',
            pluginContext: {
                loggerFactory
            },
        };

        expect(await aclChecker.allowed(req, user)).toBeTruthy();

        const req2: any = {
            path: '/a/bit/more/complicated',
            method: 'GET',
            pluginContext: {
                loggerFactory
            },
        };
        expect(await aclChecker.allowed(req2, user)).toBeTruthy();

        const req3: any = {
            path: '/portal2/foo',
            method: 'GET',
            pluginContext: {
                loggerFactory
            },
        };
        expect(await aclChecker.allowed(req3, user)).toBeTruthy();


        const req4: any = {
            path: '/portal3',
            method: 'GET',
            pluginContext: {
                loggerFactory
            },
        };
        expect(await aclChecker.allowed(req4, user)).toBeTruthy();
    });

    it('should allow a user with the required role at a protected path', async () => {
        const aclPath = './test_acl.json';
        const aclChecker = new MashroomSecurityACLChecker(aclPath, __dirname, loggerFactory);

        const req: any = {
            path: '/portal/foo/bar',
            method: 'GET',
            pluginContext: {
                loggerFactory
            }
        };

        const user: MashroomSecurityUser = {
            username: 'test',
            displayName: 'Test',
            roles: Object.freeze(['User'])
        };

        const allowed = await aclChecker.allowed(req, user);

        expect(allowed).toBeTruthy();
    });

    it('should not allow http method when denied for all', async () => {
        const aclPath = './test_acl.json';
        const aclChecker = new MashroomSecurityACLChecker(aclPath, __dirname, loggerFactory);

        const req: any = {
            path: '/portal/foo/bar',
            method: 'DELETE',
            pluginContext: {
                loggerFactory
            },
        };

        const user: MashroomSecurityUser = {
            username: 'test',
            displayName: 'Test',
            roles: Object.freeze(['User'])
        };

        const allowed = await aclChecker.allowed(req, user);

        expect(allowed).toBeFalsy();
    });

    it('should not allow denied role even if the user has an allowed role', async () => {
        const aclPath = './test_acl.json';
        const aclChecker = new MashroomSecurityACLChecker(aclPath, __dirname, loggerFactory);

        const req: any = {
            path: '/foo/x/bar',
            method: 'GET',
            pluginContext: {
                loggerFactory
            },
        };

        const user: MashroomSecurityUser = {
            username: 'test',
            displayName: 'Test',
            roles: Object.freeze(['User', 'Manager'])
        };

        const allowed = await aclChecker.allowed(req, user);

        expect(allowed).toBeFalsy();
    });

});
