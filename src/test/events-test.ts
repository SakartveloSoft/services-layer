import {eventsOf, OwnedEventData} from "../index";
import {expect} from "chai";

describe('Check typed events in practice', () => {
    it('add emitter to object', () => {
        class ServiceEvent extends OwnedEventData<ServiceImpl> {
        }
        class EventA extends ServiceEvent {
            str1?: string;
            flagA?: boolean;
        }
        class EventB extends ServiceEvent {
            testA?: number;
            flagB?: boolean;
        }

        class EventC extends ServiceEvent {
            text?: string;
            values?: any[];
        }

        class ServiceImpl {
            done:boolean = false;
            public doIt():string {
                this.done = true;
                return 'It has been done';
            }
            private fireEventC(params:Partial<EventC>) {
                eventsOf<ServiceImpl>(this).emit(EventC, params);
            }
            doWithEventC(name:string, ...values:any[]) {
                this.fireEventC({
                    text:name,
                    values:values
                });
            }


        }

        let serviceA = new ServiceImpl();
        let eventACalled = false;
        eventsOf(serviceA).on(EventA, evt => {
            expect(evt.source?.doIt()).equal( 'It has been done');
        });
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
        expect(serviceA.done).equal(true, 'Service method must be called after event invocation');
        let oneTimeEventsCounter = 0;
        let oneTimeEventArgs:[boolean?, number?] = [undefined, undefined];
        eventsOf(serviceA).once(EventB, (evt) => {
            oneTimeEventsCounter = oneTimeEventsCounter + 1;
            oneTimeEventArgs = [evt.flagB, evt.testA]
        })
        eventsOf(serviceA).emit(EventB, {
            flagB:true,
            testA: 5
        });
        eventsOf(serviceA).emit(EventB, {
            flagB: false,
            testA:10
        });
        expect(oneTimeEventsCounter).equal(1, 'One-time event handler can be called only once');
        expect(oneTimeEventArgs[0]).equal(true, 'Data effect 1 of second emission should not happen');
        expect(oneTimeEventArgs[1]).equal(5, 'Data effect 2 of second emission should not happen');

        eventsOf(serviceA).on(EventC, evt => {
            expect(evt.text).equal('Event C Text');
            expect(evt.values).length(3);
        });
        serviceA.doWithEventC('Event C Text', 1, true, "Str");
    });
});