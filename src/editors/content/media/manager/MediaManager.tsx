import * as React from 'react';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { Button } from 'editors/content/common/Button';
import { MediaIcon } from './MediaIcon';
import { Media, MediaItem } from 'types/media';
import guid from 'utils/guid';
import { convert, stringFormat } from 'utils/format';
import * as persistence from 'data/persistence';
import { AppContext } from 'editors/common/AppContext';
import { OrderedMediaLibrary } from 'editors/content/media/OrderedMediaLibrary';
import { webContentsPath } from '../utils';

import './MediaManager.scss';

const PAGELOAD_TRIGGER_MARGIN_PX = 100;
const MAX_NAME_LENGTH = 26;
const PAGE_LOADING_MESSAGE = 'Hang on while more items are loaded...';

export enum MIMETYPE_FILTERS {
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  ALL = '',
}

export enum SELECTION_TYPES {
  MULTI,
  SINGLE,
  NONE,
}

const test = SELECTION_TYPES.SINGLE | SELECTION_TYPES.NONE;

export enum LAYOUTS {
  GRID,
  LIST,
}

const SORT_MAPPINGS = {
  Newest: {
    orderBy: 'dateCreated',
    order: 'desc',
    icon: 'fa fa-calendar',
  },
  Oldest: {
    orderBy: 'dateCreated',
    order: 'asc',
    icon: 'fa fa-calendar',
  },
  'A-Z': {
    orderBy: 'fileName',
    order: 'asc',
    icon: 'fa fa-sort-alpha-asc',
  },
  'Z-A': {
    orderBy: 'fileName',
    order: 'desc',
    icon: 'fa fa-sort-alpha-desc',
  },
  Type: {
    orderBy: 'mimeType',
    order: 'asc',
    icon: 'fa fa-file-image-o',
  },
  'File Size': {
    orderBy: 'fileSize',
    order: 'asc',
    icon: 'fa fa-sort-numeric-asc',
  },
};

const getSortMappingKey = (orderBy: string, order?: string) => {
  return Object.keys(SORT_MAPPINGS).find(key =>
    orderBy === SORT_MAPPINGS[key].orderBy
    && (order === undefined || order === SORT_MAPPINGS[key].order));
};

export interface MediaManagerProps {
  className?: string;
  model: Media;
  context: AppContext;
  media: Maybe<OrderedMediaLibrary>;
  mimeFilter?: string;
  selectionType: SELECTION_TYPES;
  initialSelectionPaths: string[];
  onEdit: (updated: Media) => void;
  onLoadCourseMediaNextPage: (
    mimeFilter: string, searchText: string,
    orderBy: string, order: string) => void;
  onResetMedia: () => void;
  onSelectionChange: (selection: MediaItem[]) => void;
  onLoadMediaItemByPath: (path: string) => Promise<Maybe<MediaItem>>;
}

export interface MediaManagerState {
  selection: Immutable.List<string>;
  searchText: string;
  orderBy: string;
  order: string;
  layout: LAYOUTS;
  showDetails: boolean;
}

/**
 * MediaManager React Component
 */
export class MediaManager extends React.PureComponent<MediaManagerProps, MediaManagerState> {
  scrollView: HTMLElement;
  scrollContent: HTMLElement;

  constructor(props) {
    super(props);

    this.state = {
      selection: Immutable.List<string>(),
      searchText: undefined,
      orderBy: SORT_MAPPINGS.Newest.orderBy,
      order: SORT_MAPPINGS.Newest.order,
      layout: LAYOUTS.GRID,
      showDetails: true,
    };

    this.onScroll = this.onScroll.bind(this);
    this.isSelected = this.isSelected.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.onChangeLayout = this.onChangeLayout.bind(this);
  }

  componentDidMount() {
    const { mimeFilter, initialSelectionPaths,
      onLoadCourseMediaNextPage, onLoadMediaItemByPath } = this.props;
    const { searchText, orderBy, order, selection } = this.state;

    onLoadCourseMediaNextPage(mimeFilter, searchText, orderBy, order);

    // load initial selection data
    if (initialSelectionPaths) {
      Promise.all(initialSelectionPaths.filter(path => path).map(path =>
        onLoadMediaItemByPath(path.replace(/^\.+\//, ''))),
      ).then((mediaItems) => {
        this.setState({
          selection: Immutable.List(
            mediaItems.map(mi =>
              mi.caseOf({
                just: item => item.guid,
                nothing: () => undefined,
              }),
            ).filter(i => i),
          ),
        });
      });
    }
  }

  componentWillUnmount() {
    const { onResetMedia } = this.props;

    this.scrollView.removeEventListener('scroll', this.onScroll);
    onResetMedia();
  }

  onUploadClick(id: string) {
    (window as any).$('#' + id).trigger('click');
  }

  setupScrollListener(scrollView: HTMLElement) {
    if (!scrollView) {
      return;
    }

    if (this.scrollView) {
      this.scrollView.removeEventListener('scroll', this.onScroll);
    }

    this.scrollView = scrollView;
    this.scrollView.addEventListener('scroll', this.onScroll);
  }

  onScroll() {
    const { media, mimeFilter, onLoadCourseMediaNextPage } = this.props;
    const { searchText, orderBy, order } = this.state;

    const isLoadingMedia = media.caseOf({
      just: ml => ml.isLoading,
      nothing: () => false,
    });

    const allItemsLoaded = media.caseOf({
      just: ml => ml.items.size >= ml.totalItems,
      nothing: () => false,
    });

    if (allItemsLoaded) {
      this.scrollView.removeEventListener('scroll', this.onScroll);
      return;
    }

    if (!isLoadingMedia && this.scrollView.scrollTop + PAGELOAD_TRIGGER_MARGIN_PX
        > (this.scrollContent.offsetHeight - this.scrollView.offsetHeight)) {
      onLoadCourseMediaNextPage(mimeFilter, searchText, orderBy, order);
    }
  }

  onFileUpload(files: FileList) {
    const { context: { courseId }, mimeFilter, onLoadCourseMediaNextPage,
      onResetMedia } = this.props;
    const { searchText, orderBy, order } = this.state;

    // get a list of the files to upload
    const fileList = [];
    for (let i = 0; i < files.length; i = i + 1) {
      fileList.push(files[i]);
    }

    // the server creates a lock on upload, so we must upload files one at a
    // time. This factory function returns a new promise to upload a file
    // recursively until fileList is empty
    const createWebContentPromiseFactory = (courseId, file) =>
      persistence.createWebContent(courseId, file)
        .then((result) => {
          if (fileList.length > 0) {
            return createWebContentPromiseFactory(courseId, fileList.pop());
          }
        });

    // sequentially upload files one at a time, then reload the media page
    createWebContentPromiseFactory(courseId, fileList.pop())
      .then((result) => {
        onResetMedia();
        onLoadCourseMediaNextPage(mimeFilter, searchText, orderBy, order);
      });
  }

  onChangeLayout(newLayout: LAYOUTS) {
    this.setState({
      layout: newLayout,
    });
  }

  isSelected(guid) {
    const { selection } = this.state;

    return selection.includes(guid);
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
    const { orderBy, order } = this.state;

    onResetMedia();
    onLoadCourseMediaNextPage(mimeFilter, searchText, orderBy, order);
  }

  onSortChange(sortKey: string) {
    const { mimeFilter, onLoadCourseMediaNextPage, onResetMedia } = this.props;
    const { searchText } = this.state;

    this.setState({
      orderBy: SORT_MAPPINGS[sortKey].orderBy,
      order: SORT_MAPPINGS[sortKey].order,
    });

    onResetMedia();
    onLoadCourseMediaNextPage(
      mimeFilter, searchText, SORT_MAPPINGS[sortKey].orderBy, SORT_MAPPINGS[sortKey].order);
  }

  renderMediaList() {
    const { media, selectionType, context } = this.props;

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

    const mediaItemRefs = media.caseOf({
      just: ml => ml.references,
      nothing: () => Immutable.Map<string, number>(),
    });

    return (
      <div className="media-list">
        <div className="list-header">
          <div className="sel-col"/>
          <div className="name-col">Name</div>
          <div className="refs-col">References</div>
          <div className="date-col">Date Modified</div>
          <div className="size-col">Size</div>
        </div>
        <div className="list-body" ref={el => this.setupScrollListener(el)}>
          <div ref={el => this.scrollContent = el}>
            {mediaItems.map(item => (
              <div key={item.guid}
                  className={
                    `media-item ${this.isSelected(item.guid) ? 'selected' : ''} `
                    + `${selectionType !== SELECTION_TYPES.NONE ? 'selectable' : ''}`}
                  onClick={() => this.onSelect(item.guid)}>
                <div className="sel-col">
                  <input
                      type="checkbox"
                      readOnly
                      className="selection-check"
                      checked={this.isSelected(item.guid)}
                      onClick={() => this.onSelect(item.guid)} />
                </div>
                <div className="name-col">
                  <MediaIcon
                      filename={item.fileName}
                      mimeType={item.mimeType}
                      url={webContentsPath(item.pathTo, context.resourcePath, context.courseId)} />
                  {` ${item.fileName}`}
                </div>
                <div className="refs-col">{mediaItemRefs.get(item.guid)}</div>
                <div className="date-col">{item.dateUpdated}</div>
                <div className="size-col">{convert.toByteNotation(item.fileSize)}</div>
              </div>
            ))}
            {isLoadingMedia && !allItemsLoaded
              ? (
                <div key="loading" className="loading">
                  <i className="fa fa-circle-o-notch fa-spin fa-1x fa-fw" />
                  {PAGE_LOADING_MESSAGE}
                </div>
              )
              : null
            }
          </div>
        </div>
      </div>
    );
  }

  renderMediaGrid() {
    const { media, selectionType, context } = this.props;

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
      <div className="media-grid" ref={el => this.setupScrollListener(el)}>
        <div className="scroll-content" ref={el => this.scrollContent = el}>
          {mediaItems.map(item => (
            <div key={item.guid}
                className={`media-item ${this.isSelected(item.guid) ? 'selected' : ''} `
                  + `${selectionType !== SELECTION_TYPES.NONE ? 'selectable' : ''}`}
                onClick={() => this.onSelect(item.guid)}>
              <input
                  type="checkbox"
                  readOnly
                  className="selection-check"
                  checked={this.isSelected(item.guid)}
                  onClick={() => this.onSelect(item.guid)} />
              <MediaIcon
                  filename={item.fileName}
                  mimeType={item.mimeType}
                  url={webContentsPath(item.pathTo, context.resourcePath, context.courseId)} />
              <div className="name">
                {stringFormat.ellipsize(item.fileName, MAX_NAME_LENGTH, 5)}
              </div>
            </div>
          ))}
        </div>
        {isLoadingMedia && !allItemsLoaded
          ? (
            <div className="loading">
              <i className="fa fa-circle-o-notch fa-spin fa-1x fa-fw" />
              {PAGE_LOADING_MESSAGE}
            </div>
          )
          : null
        }
      </div>
    );
  }

  renderMediaSelectionDetails() {
    const { media, selectionType, context } = this.props;
    const { selection, showDetails } = this.state;

    const selectedMediaItems: MediaItem[] = media.caseOf({
      just: ml => selection.map(guid => ml.data.get(guid)).toArray(),
      nothing: () => [],
    });

    const mediaItemRefs = media.caseOf({
      just: ml => ml.references,
      nothing: () => Immutable.Map<string, number>(),
    });

    if (selectedMediaItems.length > 1) {
      return (
        <div className="media-selection-details">
          <div className="details-title">
            Multiple Items Selected
          </div>
        </div>
      );
    }
    const selectedItem = selectedMediaItems[0];
    if (selectedMediaItems.length > 0) {
      return (
        <div className="media-selection-details">
          <div className="details-title">
            <a
              href={webContentsPath(
                selectedItem.pathTo, context.resourcePath, context.courseId)}
              target="_blank"  >
              {stringFormat.ellipsize(selectedItem.fileName, 65, 5)}</a>
            <div className="flex-spacer" />
            <Button type="link" editMode onClick={() =>
                this.setState({ showDetails: !showDetails })}>
              {showDetails ? 'Hide' : 'Details'}
            </Button>
          </div>
          {showDetails &&
            <div className="details-content">
              <MediaIcon
                filename={selectedItem.fileName}
                mimeType={selectedItem.mimeType}
                url={webContentsPath(
                  selectedItem.pathTo, context.resourcePath, context.courseId)} />
              <div className="details-info">
                <div className="detail-row date-created">
                  <b>Created:</b> {selectedItem.dateCreated}
                </div>
                <div className="detail-row date-updated">
                  <b>Updated:</b> {selectedItem.dateUpdated}
                </div>
                <div className="detail-row file-size">
                  <b>Size:</b> {convert.toByteNotation(selectedItem.fileSize)}
                </div>
              </div>
              <div className="details-page-refs">
                <div><b>References:</b> {mediaItemRefs.get(selectedItem.guid)}</div>
              </div>
            </div>
          }
        </div>
      );
    }
  }

  render() {
    const { className, mimeFilter, media } = this.props;
    const { searchText, layout, orderBy, order } = this.state;

    const id = guid();

    const mediaCount = media.caseOf({
      just: ml => ({ numResults: ml.totalItemsLoaded, totalResults: ml.totalItems }),
      nothing: () => null,
    });

    return (
      <div className={`media-manager ${className || ''}`}>
        <div className="media-toolbar">
            <input
              id={id}
              style={ { display: 'none' } }
              accept={mimeFilter && `${mimeFilter}/*`}
              multiple={true}
              onChange={({ target: { files } }) => this.onFileUpload(files)}
              type="file" />
          <Button
              className="media-toolbar-item upload"
              editMode
              onClick={() => this.onUploadClick(id)}>
            <i className="fa fa-upload" /> Upload
          </Button>
          <div className="media-toolbar-item layout-control">
            <button
              className={`btn btn-outline-primary ${layout === LAYOUTS.GRID ? 'selected' : ''}`}
              onClick={() => this.onChangeLayout(LAYOUTS.GRID)}>
              <i className="fa fa-th" />
            </button>
            <button
              className={`btn btn-outline-primary ${layout === LAYOUTS.LIST ? 'selected' : ''}`}
              onClick={() => this.onChangeLayout(LAYOUTS.LIST)}>
              <i className="fa fa-th-list" />
            </button>
          </div>
          <div className="media-toolbar-item flex-spacer"/>
          <div className="media-toolbar-item sort-control dropdown">
            Sort By:
            <button
                className="btn btn-secondary dropdown-toggle sort-btn"
                type="button" id="dropdownMenu2"
                data-toggle="dropdown">
              <i className={SORT_MAPPINGS[getSortMappingKey(orderBy, order)].icon} />
              {` ${getSortMappingKey(orderBy, order)}`}
            </button>
            <div className="dropdown-menu">
              {Object.keys(SORT_MAPPINGS).map(sortKey =>
                <button
                  key={sortKey}
                  type="button"
                  className="dropdown-item"
                  onClick={() => this.onSortChange(sortKey)}>
                  {sortKey}
                </button>,
              )}
            </div>
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
        <div className="media-library">
          <ol className="media-sidebar">
            <li className="active">All Media</li>
            {/* <li className="">Unit 1</li>
            <li className="">Unit 2</li> */}
          </ol>
          <div className="media-content">
            {layout === LAYOUTS.GRID
              ? (this.renderMediaGrid())
              : (this.renderMediaList())
            }
            {this.renderMediaSelectionDetails()}
          </div>
        </div>
        <div className="media-infobar">
            <div className="flex-spacer"/>
            {mediaCount && mediaCount.totalResults > -Infinity &&
              <div>Showing {mediaCount.numResults} of {mediaCount.totalResults}</div>
            }
        </div>
      </div>
    );
  }
}
