// @flow

import {dummyLoggerFactory} from '@mashroom/mashroom-utils/lib/logging_utils';
import WebSocketServer from '../src/backend/WebSocketServer';

jest.useFakeTimers();

describe('WebSocketServer', () => {

    it('creates a client', () => {
        const webSocketServer = new WebSocketServer(dummyLoggerFactory);

        const webSocket: any = {
            on() {}
        };
        const user: any = {
            username: 'foo'
        };

        webSocketServer.createClient(webSocket, '/test', user, {});

        expect(webSocketServer.getClientCount()).toBe(1);
        expect(webSocketServer.getClientsOnPath('/test')).toEqual([{
            connectPath: '/test',
            user: {
                username: 'foo'
            },
            loggerContext: {},
            alive: true
        }]);
    });

    it('handles messages correctly', (done) => {
        const webSocketServer = new WebSocketServer(dummyLoggerFactory);

        let onMessageHandler = null;
        const webSocket: any = {
            on(event: string, handler: (msg: string) => void) {
                if (event === 'message') {
                    onMessageHandler = handler;
                }
            }
        };
        const user: any = {
            username: 'foo'
        };

        webSocketServer.createClient(webSocket, '/test', user, {});
        webSocketServer.addMessageListener((path, message) => path === '/test' && message.test === 1, (msg) => {
            expect(msg).toEqual({
                test: 1
            });
            done();
        });

        if (onMessageHandler) {
            onMessageHandler('{ "test": 1 }');
        }
    });

    it('handles client disconnect correctly', (done) => {
        const webSocketServer = new WebSocketServer(dummyLoggerFactory);

        let onCloseHandler = null;
        const webSocket: any = {
            on(event: string, handler: (msg: string) => void) {
                if (event === 'close') {
                    onCloseHandler = handler;
                }
            }
        };
        const user: any = {
            username: 'foo'
        };

        webSocketServer.createClient(webSocket, '/test', user, {});
        webSocketServer.addDisconnectListener(() => {
            done();
        });

        if (onCloseHandler) {
            onCloseHandler();
        }
    });
});
