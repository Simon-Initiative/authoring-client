import * as React from 'react';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { Button } from 'editors/content/common/Button';
import { MediaIcon } from './MediaIcon';
import { Media, MediaItem } from 'types/media';
import guid from 'utils/guid';
import { extractFileName } from '../utils';
import * as persistence from 'data/persistence';
import { AppContext } from 'editors/common/AppContext';
import { OrderedMediaLibrary } from 'editors/content/media/OrderedMediaLibrary';

import './MediaManager.scss';

const PAGELOAD_TRIGGER_MARGIN_PX = 100;

export enum MIMETYPE_FILTERS {
  IMAGE = 'image',
  ALL = '',
}

export enum SELECTION_TYPES {
  MULTI,
  SINGLE,
  NONE,
}

export interface MediaManagerProps {
  className?: string;
  model: Media;
  context: AppContext;
  media: Maybe<OrderedMediaLibrary>;
  mimeFilter?: string;
  selectionType: SELECTION_TYPES;
  onEdit: (updated: Media) => void;
  onLoadCourseMediaNextPage: (mimeFilter: string, pathFilter) => void;
  onResetMedia: () => void;
  onSelectionChange: (selection: MediaItem[]) => void;
}

export interface MediaManagerState {
  selection: Immutable.List<string>;
  searchText: '';
}

/**
 * MediaManager React Component
 */
export class MediaManager extends React.PureComponent<MediaManagerProps, MediaManagerState> {
  scrollView: HTMLElement;
  scrollContent: HTMLElement;
  scrollViewListener: EventListener;

  constructor(props) {
    super(props);

    this.state = {
      selection: Immutable.List<string>(),
      searchText: undefined,
    };

    this.onScroll = this.onScroll.bind(this);
    this.isSelected = this.isSelected.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.onSearch = this.onSearch.bind(this);
  }

  componentDidMount() {
    const { mimeFilter, onLoadCourseMediaNextPage } = this.props;
    const { searchText } = this.state;

    onLoadCourseMediaNextPage(mimeFilter, searchText);
  }

  componentWillUnmount() {
    const { onResetMedia } = this.props;

    this.scrollView.removeEventListener('scroll', this.scrollViewListener);
    onResetMedia();
  }

  onUploadClick(id: string) {
    (window as any).$('#' + id).trigger('click');
  }

  setupScrollListener(scrollView: HTMLElement) {
    if (!scrollView) {
      return;
    }

    this.scrollView = scrollView;
    this.scrollView.addEventListener('scroll', this.onScroll);
  }

  onScroll() {
    const { media, mimeFilter, onLoadCourseMediaNextPage } = this.props;
    const { searchText } = this.state;

    const isLoadingMedia = media.caseOf({
      just: ml => ml.isLoading,
      nothing: () => false,
    });

    const allItemsLoaded = media.caseOf({
      just: ml => ml.items.size >= ml.totalItems,
      nothing: () => false,
    });

    if (allItemsLoaded) {
      this.scrollView.removeEventListener('scroll', this.scrollViewListener);
      return;
    }

    if (!isLoadingMedia && this.scrollView.scrollTop + PAGELOAD_TRIGGER_MARGIN_PX
        > (this.scrollContent.offsetHeight - this.scrollView.offsetHeight)) {
      onLoadCourseMediaNextPage(mimeFilter, searchText);
    }
  }

  adjust(path) {
    const { context } = this.props;

    const dirCount = context.resourcePath.split('\/').length;
    let updated = 'webcontents/' + context.courseId + '/' + path;
    for (let i = 0; i < dirCount; i += 1) {
      updated = '../' + updated;
    }

    return updated;
  }

  onFileUpload(file) {
    const { context: { courseId }, mimeFilter, onLoadCourseMediaNextPage,
      onResetMedia } = this.props;
    const { searchText } = this.state;

    persistence.createWebContent(courseId, file)
      .then((result) => {
        onResetMedia();
        onLoadCourseMediaNextPage(mimeFilter, searchText);
      });
  }

  isSelected(guid) {
    const { selection } = this.state;

    return !!selection.find(s => s === guid);
  }

  onSelect(guid) {
    const { media, selectionType, onSelectionChange } = this.props;
    const { selection } = this.state;

    let updatedSelection = selection;

    if (selectionType === SELECTION_TYPES.SINGLE) {
      // clear the current selection
      updatedSelection = Immutable.List([guid]);
    } else if (selectionType === SELECTION_TYPES.MULTI) {
      if (this.isSelected(guid)) {
        // unselect item
        updatedSelection = updatedSelection.remove(updatedSelection.findIndex(s => s === guid));
      } else {
        // select item
        updatedSelection = updatedSelection.push(guid);
      }
    } else {
      return;
    }

    this.setState({
      selection: updatedSelection,
    });

    const mediaLibrary = media.valueOr(null);
    if (mediaLibrary) {
      onSelectionChange(updatedSelection.map(s => mediaLibrary.getItem(s)).toArray());
    }
  }

  onSearch(searchText: string) {
    const { mimeFilter, onLoadCourseMediaNextPage, onResetMedia } = this.props;

    onResetMedia();
    onLoadCourseMediaNextPage(mimeFilter, searchText);
  }

  renderMediaGrid () {
    const { media, selectionType } = this.props;

    const isLoadingMedia = media.caseOf({
      just: ml => ml.isLoading,
      nothing: () => false,
    });

    const allItemsLoaded = media.caseOf({
      just: ml => ml.allItemsLoaded(),
      nothing: () => false,
    });

    const mediaItems: MediaItem[] = media.caseOf({
      just: ml => ml.getItems(),
      nothing: () => [],
    });

    return (
      <React.Fragment>
        <ol ref={el => this.scrollContent = el}>
          {mediaItems.map(item => (
            <li key={item.guid}
                className={`media-item ${this.isSelected(item.guid) ? 'selected' : ''} `
                  + `${selectionType !== SELECTION_TYPES.NONE ? 'selectable' : ''}`}
                onClick={() => this.onSelect(item.guid)}>
              <input
                  type="checkbox"
                  className="selection-check"
                  checked={this.isSelected(item.guid)}
                  onClick={() => this.onSelect(item.guid)} />
              <MediaIcon
                  filename={extractFileName(item.pathTo)}
                  mimeType={item.mimeType}
                  url={this.adjust(item.pathTo)} />
              <div className="name">{extractFileName(item.pathTo)}</div>
            </li>
          ))}
        </ol>
        {isLoadingMedia && !allItemsLoaded
          ? (
            <div className="loading">
              <i className="fa fa-circle-o-notch fa-spin fa-1x fa-fw" />
              Hang on while more items are loaded...
            </div>
          )
          : null
        }
      </React.Fragment>
    );
  }

  render() {
    const { className, mimeFilter } = this.props;
    const { searchText } = this.state;

    const id = guid();

    return (
      <div className={`media-manager ${className || ''}`}>
        <div className="media-toolbar">
            <input
              id={id}
              style={ { display: 'none' } }
              accept={`${mimeFilter}*`}
              onChange={({ target: { files } }) => this.onFileUpload(files[0])}
              type="file" />
          <Button
              className="media-toolbar-item upload"
              editMode
              onClick={() => this.onUploadClick(id)}>
            <i className="fa fa-upload" /> Upload
          </Button>
          <div className="media-toolbar-item flex-spacer"/>
          <div className="media-toolbar-item sort-control">
            Sort: Newest <i className="fa fa-angle-down" />
          </div>
          <div className="media-toolbar-item search">
          <div className="input-group">
            <span className="input-group-addon">
              <i className="fa fa-search" />
            </span>
            <input
                type="text"
                className="form-control"
                placeholder="Search"
                value={searchText}
                onChange={({ target: { value } }) => this.onSearch(value)} />
          </div>
          </div>
        </div>
        <div className="media-content">
          <ol className="media-sidebar">
            <li className="active">All Media</li>
            {/* <li className="">Unit 1</li>
            <li className="">Unit 2</li> */}
          </ol>
          <div className="media-grid" ref={el => this.setupScrollListener(el)}>
            {this.renderMediaGrid()}
          </div>
        </div>
      </div>
    );
  }
}
