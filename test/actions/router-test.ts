import { Map } from 'immutable';
import {
  getUrlParams, stringifyUrlParams, getRouteFromPath, ROUTE,
} from 'actions/router';

describe('getUrlParams', () => {

  it('should return no parameters', () => {
    const search = '?';
    expect(getUrlParams(search).toJS()).toEqual({});
  });

  it('should return parameter one=1', () => {
    const search = '?one=1';
    expect(getUrlParams(search).toJS()).toEqual({ one: '1' });
  });

  it('should return parameters one=1, two=two, hello=false', () => {
    const search = '?one=1&two=two&hello=false';
    expect(getUrlParams(search).toJS()).toEqual({ one: '1', two: 'two', hello: 'false' });
  });

  it('should not return parameters that are empty', () => {
    const search = '?one=1&two=&hello=';
    expect(getUrlParams(search).toJS()).toEqual({ one: '1' });
  });

});

describe('stringifyUrlParams', () => {

  it('should stringify one=1, two=two', () => {
    const params = Map<string, string>({ one: 1, two: 'two' });
    expect(stringifyUrlParams(params)).toEqual('?one=1&two=two');
  });

  it('should stringify one=1, two=\'\', three=true', () => {
    const params = Map<string, string>({ one: 1, two: '', three: true });
    expect(stringifyUrlParams(params)).toEqual('?one=1&two=&three=true');
  });

  it('should stringify empty map', () => {
    const params = Map<string, string>();
    expect(stringifyUrlParams(params)).toEqual('?');
  });

});

describe('getRouteFromPath', () => {

  it('should return course resource route', () => {
    const path = '2c92808866d069100166d0a014a70006-2c92808866d069100166d0a014a70006';
    const search = '?';

    const route = getRouteFromPath(path, search);
    expect(route.route).toEqual(ROUTE.RESOURCE);
    expect(route.courseId.valueOr('NOTHING')).toEqual('2c92808866d069100166d0a014a70006');
    expect(route.resourceId.valueOr('NOTHING')).toEqual('2c92808866d069100166d0a014a70006');
    expect(route.urlParams.toJS()).toEqual({});
  });

  it('should return resource route', () => {
    const path = '2c92808a66ef8e6b0166f54c5eea0000-2c92808866d069100166d0a014a70006';
    const search = '';

    const route = getRouteFromPath(path, search);
    expect(route.route).toEqual(ROUTE.RESOURCE);
    expect(route.courseId.valueOr('NOTHING')).toEqual('2c92808866d069100166d0a014a70006');
    expect(route.resourceId.valueOr('NOTHING')).toEqual('2c92808a66ef8e6b0166f54c5eea0000');
    expect(route.urlParams.toJS()).toEqual({});
  });

  it('should return resource route with questionId param', () => {
    const path = '2c92808a66ef8e6b0166f54c5eea0000-2c92808866d069100166d0a014a70006';
    const search = '?questionId=some_question_id';

    const route = getRouteFromPath(path, search);
    expect(route.route).toEqual(ROUTE.RESOURCE);
    expect(route.courseId.valueOr('NOTHING')).toEqual('2c92808866d069100166d0a014a70006');
    expect(route.resourceId.valueOr('NOTHING')).toEqual('2c92808a66ef8e6b0166f54c5eea0000');
    expect(route.urlParams.toJS()).toEqual({ questionId: 'some_question_id' });
  });

  it('should return create route', () => {
    const path = 'create';
    const search = '';

    const route = getRouteFromPath(path, search);
    expect(route.route).toEqual(ROUTE.CREATE);
    expect(route.courseId.valueOr('NOTHING')).toEqual('NOTHING');
    expect(route.resourceId.valueOr('NOTHING')).toEqual('NOTHING');
    expect(route.urlParams.toJS()).toEqual({});
  });

  it('should return import route', () => {
    const path = 'import';
    const search = '';

    const route = getRouteFromPath(path, search);
    expect(route.route).toEqual(ROUTE.IMPORT);
    expect(route.courseId.valueOr('NOTHING')).toEqual('NOTHING');
    expect(route.resourceId.valueOr('NOTHING')).toEqual('NOTHING');
    expect(route.urlParams.toJS()).toEqual({});
  });

  it('should return resources route with filter param', () => {
    const path = 'resources-2c92808866d069100166d0a014a70006';
    const search = '?filter=id';

    const route = getRouteFromPath(path, search);
    expect(route.route).toEqual(ROUTE.ALL_RESOURCES);
    expect(route.courseId.valueOr('NOTHING')).toEqual('2c92808866d069100166d0a014a70006');
    expect(route.resourceId.valueOr('NOTHING')).toEqual('resources');
    expect(route.urlParams.toJS()).toEqual({ filter: 'id' });
  });

});
