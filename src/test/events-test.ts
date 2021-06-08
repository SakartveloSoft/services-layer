import {eventsOf, EventData, EventsEmitter, OwnedEventData} from "../index";
import {expect} from "chai";
import {checkPrime} from "crypto";

describe('Check typed events in practice', () => {
    it('add emitter to object', () => {
        class EventA extends OwnedEventData<ServiceImpl> {
            str1?: string;
            flagA?: boolean;
        }
        class EventB extends OwnedEventData<ServiceImpl> {
            testA?: number;
            flagB?: boolean;
        }

        class ServiceImpl {
            doIt():boolean {
                return true;
            }
        }

        let serviceA = new ServiceImpl();
        let eventACalled = false;
        eventsOf(serviceA).on(EventA, evt => {
            expect(evt).haveOwnProperty('source');
            expect(evt.source).equal(serviceA, 'Owner reference at event must natch the emitter owner');
            eventACalled = true;
        });
        expect(eventACalled).equal(false, 'event handler must be not called yet');
        eventsOf(serviceA).emit(EventA, {
            flagA: true,
            str1: 'test'
        });
        expect(eventACalled).equal(true, 'event handler must be called after emit');


    });
});