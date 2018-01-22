import { connect, Dispatch } from 'react-redux';
import { Map } from 'immutable';
import { Maybe } from 'tsmonad';
import { State } from 'reducers';
import { fetchCourseMediaNextPage, clearMedia } from 'actions/media';
import { OrderedMediaLibrary } from 'editors/content/media/OrderedMediaLibrary';
import { Media, MediaItem } from 'types/media';
import { AppContext } from 'editors/common/AppContext';
import { MediaManager } from './MediaManager';

interface StateProps {
  media: Maybe<OrderedMediaLibrary>;
}

interface DispatchProps {
  onLoadCourseMediaNextPage: (mimeFilter?: string) => void;
  onClose: () => void;
}

interface OwnProps {
  className?: string;
  model: Media;
  onEdit: (updated: Media) => void;
  context: AppContext;
  mimeFilter?: string;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {
    media: Maybe.maybe(state.media.get(ownProps.context.courseId)),
  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {
    onLoadCourseMediaNextPage: (mimeFilter) => {
      dispatch(fetchCourseMediaNextPage(ownProps.context.courseId, mimeFilter));
    },
    onClose: () => {
      dispatch(clearMedia(ownProps.context.courseId));
    },
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
    (mapStateToProps, mapDispatchToProps)(MediaManager);

export { controller as MediaManager };
