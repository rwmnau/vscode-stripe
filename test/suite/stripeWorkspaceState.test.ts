import * as assert from 'assert';
import * as sinon from 'sinon';

import {TestMemento, mocks} from '../mocks/vscode';
import {
  addEventDetails,
  clearEventDetails,
  eventDetailsKey,
  getRecentEvents,
  initializeStripeWorkspaceState,
  recentEventsKey,
  recordEvent,
  retrieveEventDetails,
} from '../../src/stripeWorkspaceState';

suite('stripeWorkspaceState', () => {
  let sandbox: sinon.SinonSandbox;
  setup(() => {
    sandbox = sinon.createSandbox();
  });

  teardown(() => {
    sandbox.restore();
  });

  test('initialize sets up all keys', () => {
    const workspaceState = new TestMemento();
    const extensionContext = {...mocks.extensionContextMock, workspaceState: workspaceState};

    initializeStripeWorkspaceState(extensionContext);

    // Verify RecentEvents is present with an empty array
    assert.deepStrictEqual(extensionContext.workspaceState.get(recentEventsKey), []);

    // Verify EventDetails is present with an empy Map
    assert.deepStrictEqual(extensionContext.workspaceState.get(eventDetailsKey), new Map());
  });

  suite('RecentEvents', () => {
    test('getRecentEvents returns all events when limit is undefined', () => {
      const workspaceState = new TestMemento();
      const extensionContext = {...mocks.extensionContextMock, workspaceState: workspaceState};

      const eventsList = ['a', 'b', 'c', 'd', 'e'];
      workspaceState.update(recentEventsKey, eventsList);

      const recentEvents = getRecentEvents(extensionContext);

      assert.deepStrictEqual(recentEvents, eventsList);
    });

    test('getRecentEvents returns subset of events when limit is set', () => {
      const workspaceState = new TestMemento();
      const extensionContext = {...mocks.extensionContextMock, workspaceState: workspaceState};

      const eventsList = ['a', 'b', 'c', 'd', 'e'];
      workspaceState.update(recentEventsKey, eventsList);

      const recentEvents = getRecentEvents(extensionContext, 2);

      assert.deepStrictEqual(recentEvents, ['a', 'b']);
    });

    test('recordEvent adds event on top', () => {
      const workspaceState = new TestMemento();
      const extensionContext = {...mocks.extensionContextMock, workspaceState: workspaceState};

      recordEvent(extensionContext, 'a');
      recordEvent(extensionContext, 'b');
      recordEvent(extensionContext, 'c');

      const recentEvents = getRecentEvents(extensionContext);

      assert.deepStrictEqual(recentEvents, ['c', 'b', 'a']);
    });
  });

  suite('EventDetails', () => {
    test('add and retrieve event details', () => {
      const workspaceState = new TestMemento();
      const extensionContext = {...mocks.extensionContextMock, workspaceState: workspaceState};

      const eventId = 'event_id';
      const eventObject = {eventId: eventId, value: 'hello'};

      addEventDetails(extensionContext, eventId, eventObject);

      assert.deepStrictEqual(retrieveEventDetails(extensionContext, eventId), eventObject);
    });

    test('clearEventDetails empties EventDetails key', () => {
      const workspaceState = new TestMemento();
      const extensionContext = {...mocks.extensionContextMock, workspaceState: workspaceState};

      // manually populate memento
      const eventDetailsMap = new Map<string, any>();
      eventDetailsMap.set('event_id', {value: 'blah'});
      extensionContext.workspaceState.update(eventDetailsKey, eventDetailsMap);

      clearEventDetails(extensionContext);

      assert.deepStrictEqual(extensionContext.workspaceState.get(eventDetailsKey), new Map());
    });
  });
});
