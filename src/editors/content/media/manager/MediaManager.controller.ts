import { connect, Dispatch } from 'react-redux';
import { Maybe } from 'tsmonad';
import { State } from 'reducers';
import { fetchCourseMediaNextPage, resetMedia } from 'actions/media';
import { OrderedMediaLibrary } from 'editors/content/media/OrderedMediaLibrary';
import { Media, MediaItem } from 'types/media';
import { AppContext } from 'editors/common/AppContext';
import { MediaManager, SELECTION_TYPES } from './MediaManager';

interface StateProps {
  media: Maybe<OrderedMediaLibrary>;
}

interface DispatchProps {
  onLoadCourseMediaNextPage: (
    mimeFilter: string, searchText: string,
    orderBy: string, order: string) => void;
  onResetMedia: () => void;
}

interface OwnProps {
  className?: string;
  model: Media;
  context: AppContext;
  mimeFilter?: string;
  selectionType: SELECTION_TYPES;
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
    onLoadCourseMediaNextPage: (mimeFilter, searchText, orderBy, order) => {
      dispatch(fetchCourseMediaNextPage(
        ownProps.context.courseId, mimeFilter, searchText, orderBy, order));
    },
    onResetMedia: () => {
      dispatch(resetMedia(ownProps.context.courseId));
    },
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
    (mapStateToProps, mapDispatchToProps)(MediaManager);

export { controller as MediaManager };
