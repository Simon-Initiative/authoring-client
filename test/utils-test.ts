import {makeActionCreator} from '../src/actions/utils'

it('creates an action creator', () => {
  let actionCreator = makeActionCreator('TEST', 'guid');
  let action = actionCreator('someUuid');

  expect(action.type).toBe('TEdST');
  expect((action as any).guid).toBe('someUuid');
});
