import { titles, TitlesState } from 'reducers/titles';
import { Map } from 'immutable';
import {
  ReceiveTitlesAction,
  RECEIVE_TITLES,
  RESET_TITLES,
} from 'actions/course';

describe('title reducer', () => {
  it('should initialize', () => {
    const initialState: TitlesState = undefined;

    const newState = titles(initialState, { type: '' });
    expect(newState.toJS()).toEqual({});
  });

  it('should receive empty titles', () => {
    const initialState: TitlesState = Map<string, string>({
      'some-title-id': 'Title 1',
      'another-title-id': 'Title 2',
    });

    const newState = titles(initialState, { type: RECEIVE_TITLES, titles: [] });
    expect(newState.toJS()).toEqual({
      'some-title-id': 'Title 1',
      'another-title-id': 'Title 2',
    });
  });

  it('should receive updated titles', () => {
    const initialState: TitlesState = Map<string, string>({
      'some-title-id': 'Title 1',
      'another-title-id': 'Title 2',
    });

    const newState = titles(initialState, { type: RECEIVE_TITLES, titles: [{
      id: 'some-title-id',
      title: 'Updated Title 1',
    }] });
    expect(newState.toJS()).toEqual({
      'some-title-id': 'Updated Title 1',
      'another-title-id': 'Title 2',
    });
  });

  it('should receive new titles', () => {
    const initialState: TitlesState = Map<string, string>({
      'some-title-id': 'Title 1',
      'another-title-id': 'Title 2',
    });

    const newState = titles(initialState, { type: RECEIVE_TITLES, titles: [{
      id: 'some-new-title-id',
      title: 'Title 3',
    }] });
    expect(newState.toJS()).toEqual({
      'some-title-id': 'Title 1',
      'another-title-id': 'Title 2',
      'some-new-title-id': 'Title 3',
    });
  });

  it('should reset titles', () => {
    const initialState: TitlesState = Map<string, string>({
      'some-title-id': 'Title 1',
      'another-title-id': 'Title 2',
    });

    const newState = titles(initialState, { type: RESET_TITLES });
    expect(newState.toJS()).toEqual({});
  });
});
