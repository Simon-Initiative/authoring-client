import { connect, Dispatch } from 'react-redux';
import { Map } from 'immutable';
import { Maybe } from 'tsmonad';
import { State } from 'reducers';
import { fetchCourseMediaNextPage, resetMedia } from 'actions/media';
import { OrderedMediaLibrary } from 'editors/content/media/OrderedMediaLibrary';
import { Media, MediaItem } from 'types/media';
import { AppContext } from 'editors/common/AppContext';
import { MediaManager, SELECTION_TYPE } from './MediaManager';
import { media } from 'reducers/media';

interface StateProps {
  media: Maybe<OrderedMediaLibrary>;
}

interface DispatchProps {
  onLoadCourseMediaNextPage: (mimeFilter?: string, pathFilter?: string) => void;
  onResetMedia: () => void;
}

interface OwnProps {
  className?: string;
  model: Media;
  context: AppContext;
  mimeFilter?: string;
  selectionType: SELECTION_TYPE;
  onEdit: (updated: Media) => void;
  onSelectionChange: (selection: MediaItem[]) => void;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {
    media: Maybe.maybe(state.media.get(ownProps.context.courseId)),
  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {
    onLoadCourseMediaNextPage: (mimeFilter, pathFilter) => {
      dispatch(fetchCourseMediaNextPage(ownProps.context.courseId, mimeFilter, pathFilter));
    },
    onResetMedia: () => {
      dispatch(resetMedia(ownProps.context.courseId));
    },
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
    (mapStateToProps, mapDispatchToProps)(MediaManager);

export { controller as MediaManager };
