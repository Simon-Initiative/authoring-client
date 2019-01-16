import { Map } from 'immutable';
import {
  updateRoute, ROUTE, setSearchParam,
} from 'actions/router';
import { router, RouterState } from 'reducers/router';

describe('router reducer', () => {

  it('should update route', () => {
    const path = '2c92808a66ef8e6b0166f54c5eea0000-2c92808866d069100166d0a014a70006';
    const search = '';

    const initialState = new RouterState();
    const updatedState = router(initialState, updateRoute(path, search));

    expect(updatedState.route).toEqual(ROUTE.RESOURCE);
    expect(updatedState.path)
      .toEqual('2c92808a66ef8e6b0166f54c5eea0000-2c92808866d069100166d0a014a70006');
    expect(updatedState.search).toEqual('');
    expect(updatedState.courseId.valueOr('NOTHING')).toEqual('2c92808866d069100166d0a014a70006');
    expect(updatedState.resourceId.valueOr('NOTHING')).toEqual('2c92808a66ef8e6b0166f54c5eea0000');
    expect(updatedState.urlParams.toJS()).toEqual({});
  });

  it('should update route with params', () => {
    const path = '2c92808a66ef8e6b0166f54c5eea0000-2c92808866d069100166d0a014a70006';
    const search = '?questionId=some_question_id&filter=id';

    const initialState = new RouterState();
    const updatedState = router(initialState, updateRoute(path, search));

    expect(updatedState.route).toEqual(ROUTE.RESOURCE);
    expect(updatedState.path)
      .toEqual('2c92808a66ef8e6b0166f54c5eea0000-2c92808866d069100166d0a014a70006');
    expect(updatedState.search).toEqual('?questionId=some_question_id&filter=id');
    expect(updatedState.courseId.valueOr('NOTHING')).toEqual('2c92808866d069100166d0a014a70006');
    expect(updatedState.resourceId.valueOr('NOTHING')).toEqual('2c92808a66ef8e6b0166f54c5eea0000');
    expect(updatedState.urlParams.toJS()).toEqual({ questionId: 'some_question_id', filter: 'id' });
  });

});
