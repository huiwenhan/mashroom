// @flow

import MashroomPortalMessageBusImpl from '../../../src/frontend/portal-client/js/MashroomPortalMessageBusImpl';

describe('MashroomPortalMessageBusImpl', () => {

    it('should send data to single subscriber', (done) => {
        const messageBus = new MashroomPortalMessageBusImpl();

        messageBus.subscribe('foo1', (data) => {
           expect(data).toEqual({
               'Hello': 'World',
           });
           done();
        });

        messageBus.publish('foo1', {
           'Hello': 'World',
        });
    });

    it('should remove subscription after first message if subscribeOnce is used', (done) => {
        const messageBus = new MashroomPortalMessageBusImpl();

        messageBus.subscribeOnce('foo1', (data) => {
            expect(data).toEqual({
                'Hello': 'World',
            });
            done();
        });

        expect(messageBus._subscriptionMap['foo1'].length).toBe(1);

        messageBus.publish('foo1', {
            'Hello': 'World',
        });

        expect(messageBus._subscriptionMap['foo1'].length).toBe(0);
    });

    it('should not fail when no subscriber', () => {
        const messageBus = new MashroomPortalMessageBusImpl();

        messageBus.publish('foo111', {
            'Hello': 'World',
        });
    });

    it('should subscribe and unsubscribe properly', () => {

        const messageBus = new MashroomPortalMessageBusImpl();
        const callback = () => {};

        messageBus.subscribe('foo2', callback);

        expect(messageBus._subscriptionMap['foo2'].length).toBe(1);

        messageBus.unsubscribe('foo2', callback);

        expect(messageBus._subscriptionMap['foo2'].length).toBe(0);
    });

    it('should prevent duplicate subscriptions', () => {

        const messageBus = new MashroomPortalMessageBusImpl();
        const callback = () => {};

        messageBus.subscribe('foo6', callback);
        messageBus.subscribe('foo6', callback);

        expect(messageBus._subscriptionMap['foo6'].length).toBe(1);
    });

    it('should work over multiple apps', (done) => {
        const messageBus = new MashroomPortalMessageBusImpl();

        messageBus.subscribe('foo3', (data) => {
            expect(data).toEqual({
                'Hello': 'World',
            });
            done();
        });

        messageBus.publish('foo3', {
            'Hello': 'World',
        });
    });

    it('should pass the senderId to the receiver', (done) => {
        const messageBus = new MashroomPortalMessageBusImpl();
        const messageBusApp1 = messageBus.getAppInstance('app1');
        const messageBusApp2 = messageBus.getAppInstance('app2');

        messageBusApp1.subscribe('foo3', (data, senderAppId) => {
            expect(senderAppId).toBe('app2');
            done();
        });

        messageBusApp2.publish('foo3', {
            'Hello': 'World',
        });
    });

    it('should intercept all messages', (done) => {
        const messageBus = new MashroomPortalMessageBusImpl();
        const messageBusApp1 = messageBus.getAppInstance('app1');
        const messageBusApp2 = messageBus.getAppInstance('app2');

        messageBus.registerMessageInterceptor((topic, data, senderAppId, receiverAppId) => {
            expect(senderAppId).toBe('app2');
            expect(receiverAppId).toBe('app1');
            expect(topic).toBe('foo3');
            expect(data).toEqual({
                'Hello': 'World',
            });
            done();
        });

        messageBusApp1.subscribe('foo3', (data, senderAppId) => {
            expect(senderAppId).toBe('app2');
        });

        messageBusApp2.publish('foo3', {
            'Hello': 'World',
        });
    });

    it('should drop a message if the interceptor return null', (done) => {
        const messageBus = new MashroomPortalMessageBusImpl();
        const messageBusApp1 = messageBus.getAppInstance('app1');
        const messageBusApp2 = messageBus.getAppInstance('app2');

        messageBus.registerMessageInterceptor(() => {
            return null;
        });

        messageBusApp1.subscribe('foo3', () => {
            throw new Error('Message must no be sent');
        });

        messageBusApp2.publish('foo3', {
            'Hello': 'World',
        });

        setTimeout(() => done(), 500);
    });

});
