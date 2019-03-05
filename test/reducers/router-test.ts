import { Map } from 'immutable';
import {
  updateRoute, ROUTE, setSearchParam,
} from 'actions/router';
import { router, RouterState } from 'reducers/router';

describe('router reducer', () => {

  it('should update route', () => {
    const path = 'resourceId-courseId-orgId';
    const search = '';

    const initialState = new RouterState();
    const updatedState = router(initialState, updateRoute(path, search));

    expect(updatedState.route).toEqual(ROUTE.RESOURCE);
    expect(updatedState.path)
      .toEqual('resourceId-courseId-orgId');
    expect(updatedState.search).toEqual('');
    expect(updatedState.courseId.valueOr('NOTHING')).toEqual('courseId');
    expect(updatedState.resourceId.valueOr('NOTHING')).toEqual('resourceId');
    expect(updatedState.orgId.valueOr('NOTHING')).toEqual('orgId');
    expect(updatedState.urlParams.toJS()).toEqual({});
  });

  it('should update route with hyphens in resource ID', () => {
    const path = 'resource-Id-dashes-courseId-orgId';
    const search = '';

    const initialState = new RouterState();
    const updatedState = router(initialState, updateRoute(path, search));

    expect(updatedState.route).toEqual(ROUTE.RESOURCE);
    expect(updatedState.path)
      .toEqual('resource-Id-dashes-courseId-orgId');
    expect(updatedState.search).toEqual('');
    expect(updatedState.courseId.valueOr('NOTHING')).toEqual('courseId');
    expect(updatedState.resourceId.valueOr('NOTHING')).toEqual('resource-Id-dashes');
    expect(updatedState.orgId.valueOr('NOTHING')).toEqual('orgId');
    expect(updatedState.urlParams.toJS()).toEqual({});
  });

  it('should update route with params', () => {
    const path = 'resourceId-courseId-orgId';
    const search = '?questionId=some_question_id&filter=id';

    const initialState = new RouterState();
    const updatedState = router(initialState, updateRoute(path, search));

    expect(updatedState.route).toEqual(ROUTE.RESOURCE);
    expect(updatedState.path)
      .toEqual('resourceId-courseId-orgId');
    expect(updatedState.search).toEqual('?questionId=some_question_id&filter=id');
    expect(updatedState.courseId.valueOr('NOTHING')).toEqual('courseId');
    expect(updatedState.resourceId.valueOr('NOTHING')).toEqual('resourceId');
    expect(updatedState.orgId.valueOr('NOTHING')).toEqual('orgId');
    expect(updatedState.urlParams.toJS()).toEqual({ questionId: 'some_question_id', filter: 'id' });
  });

});
