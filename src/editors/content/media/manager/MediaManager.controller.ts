import { connect, Dispatch } from 'react-redux';
import { Maybe } from 'tsmonad';
import { State } from 'reducers';
import { fetchCourseMediaNextPage, resetMedia, fetchMediaItemByPath } from 'actions/media';
import { OrderedMediaLibrary } from 'editors/content/media/OrderedMediaLibrary';
import { Media, MediaItem } from 'types/media';
import { MediaManager, SELECTION_TYPES } from 'editors/content/media/manager/MediaManager';
import { CourseModel } from 'data/models/course';

export { MIMETYPE_FILTERS, SELECTION_TYPES } from 'editors/content/media/manager/MediaManager';

interface StateProps {
  media: Maybe<OrderedMediaLibrary>;
}

interface DispatchProps {
  onLoadCourseMediaNextPage: (
    mimeFilter: string, searchText: string,
    orderBy: string, order: string) => void;
  onResetMedia: () => void;
  onLoadMediaItemByPath: (path: string) => Promise<Maybe<MediaItem>>;
}

interface OwnProps {
  className?: string;
  model: Media;
  courseModel: CourseModel;
  resourcePath: string;
  mimeFilter?: string;
  selectionType: SELECTION_TYPES;
  initialSelectionPaths?: string[];
  onEdit: (updated: Media) => void;
  onSelectionChange: (selection: MediaItem[]) => void;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {
    media: Maybe.maybe(state.media.get(ownProps.courseModel.guid.value())),
  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {
    onLoadCourseMediaNextPage: (mimeFilter, searchText, orderBy, order) => {
      return dispatch(fetchCourseMediaNextPage(
        ownProps.courseModel.guid, mimeFilter, searchText, orderBy, order) as any);
    },
    onResetMedia: () => {
      dispatch(resetMedia(ownProps.courseModel.guid));
    },
    onLoadMediaItemByPath: (path: string) => (
      dispatch(fetchMediaItemByPath(ownProps.courseModel.guid, path) as any)
    ),
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(MediaManager);

export { controller as MediaManager };
