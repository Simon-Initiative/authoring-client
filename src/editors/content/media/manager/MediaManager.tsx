import * as React from 'react';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { Button } from 'editors/content/common/Button';
import { MediaIcon } from 'editors/content/media/manager/MediaIcon';
import { Media, MediaItem, MediaRef } from 'types/media';
import guid from 'utils/guid';
import { convert, stringFormat } from 'utils/format';
import * as persistence from 'data/persistence';
import { OrderedMediaLibrary } from 'editors/content/media/OrderedMediaLibrary';
import { webContentsPath } from 'editors/content/media/utils';
import { CourseModel } from 'data/models/course';
import './MediaManager.scss';
import { LoadingSpinner, LoadingSpinnerSize } from 'components/common/LoadingSpinner';
import * as viewActions from 'actions/view';


const PAGELOAD_TRIGGER_MARGIN_PX = 100;
const MAX_NAME_LENGTH = 26;
const PAGE_LOADING_MESSAGE = 'Hang on while more items are loaded...';

export enum MIMETYPE_FILTERS {
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  HTML = 'text/html',
  ALL = '',
}

export enum SELECTION_TYPES {
  MULTI,
  SINGLE,
  NONE,
}

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
    icon: 'fas fa-sort-alpha-up',
  },
  'Z-A': {
    orderBy: 'fileName',
    order: 'desc',
    icon: 'fas fa-sort-alpha-down',
  },
  Type: {
    orderBy: 'mimeType',
    order: 'asc',
    icon: 'far fa-file-image',
  },
  'File Size': {
    orderBy: 'fileSize',
    order: 'asc',
    icon: 'fas fa-sort-numeric-up',
  },
};

const getSortMappingKey = (orderBy: string, order?: string) => {
  return Object.keys(SORT_MAPPINGS).find(key =>
    orderBy === SORT_MAPPINGS[key].orderBy
    && (order === undefined || order === SORT_MAPPINGS[key].order));
};

// Characters disallowed in media filenames
const BAD_CHARS = ':';
const BAD_CHAR_PAT = new RegExp('[' + BAD_CHARS + ']');

const popOpenImage = ({ target: link }) => {
  const w = window.open(
    link.href,
    link.target || '_blank',
    'menubar=no,toolbar=no,location=no,directories=no,status=no,scrollbars=no,'
    + 'resizable=no,dependent,width=800,height=620',
  );

  // allow the link to work if popup is blocked
  return w ? false : true;
};

export interface MediaManagerProps {
  className?: string;
  model: Media;
  courseModel: CourseModel;
  resourcePath: string;
  media: Maybe<OrderedMediaLibrary>;
  mimeFilter?: string;
  selectionType: SELECTION_TYPES;
  initialSelectionPaths: string[];
  onEdit: (updated: Media) => void;
  onLoadCourseMediaNextPage: (
    mimeFilter: string, searchText: string,
    orderBy: string, order: string) => Promise<Maybe<Immutable.List<MediaItem>>>;
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
  error: Maybe<string>;
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
      error: Maybe.nothing<string>(),
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
    const { searchText, orderBy, order } = this.state;

    onLoadCourseMediaNextPage(mimeFilter, searchText, orderBy, order);

    // load initial selection data
    if (initialSelectionPaths) {
      Promise.all(initialSelectionPaths.filter(path => path).map(path =>
        onLoadMediaItemByPath(path.replace(/^[./]+/, ''))),
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
          error: Maybe.nothing(),
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
    const { courseModel, mimeFilter, onLoadCourseMediaNextPage,
      onResetMedia } = this.props;
    const { searchText, orderBy, order } = this.state;

    // get a list of the files to upload
    const fileList = [];
    for (let i = 0; i < files.length; i = i + 1) {
      fileList.push(files[i]);
    }

    // AUTHORING-2319: prevent upload of files with problem characters in filename
    const badFiles = fileList.filter(f => BAD_CHAR_PAT.test(f.name));
    if (badFiles.length > 0) {
      const msg = 'Bad file name' + ((badFiles.length > 1) ? 's ' : ' ')
                  + badFiles.map(f => f.name).join(', ') + '. '
                  + 'File names should not contain ' + BAD_CHARS + ' characters';
      this.setState({ error: Maybe.just(msg) });
      return;
    }

    // the server creates a lock on upload, so we must upload files one at a
    // time. This factory function returns a new promise to upload a file
    // recursively until fileList is empty
    const results = [];
    const createWebContentPromiseFactory = (courseId, file) =>
      persistence.createWebContent(courseId, file)
        .then((result) => {
          results.push(result);

          if (fileList.length > 0) {
            return createWebContentPromiseFactory(courseId, fileList.pop());
          }

          return results;
        });

    // sequentially upload files one at a time, then reload the media page
    createWebContentPromiseFactory(courseModel.guid, fileList.pop())
      .then((result) => {
        onResetMedia();
        onLoadCourseMediaNextPage(mimeFilter, searchText, orderBy, order)
          // select the most recently uploaded item
          .then((mediaItems) => {
            mediaItems.lift((files) => {
              if (files.size > 0) {
                Maybe.maybe(files.find(f => f.pathTo === result[0])).lift(file =>
                  this.onSelect(file.guid));
              }
            });
          });
      });
  }

  onChangeLayout(newLayout: LAYOUTS) {
    this.setState({
      layout: newLayout,
      error: Maybe.nothing(),
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
      error: Maybe.nothing(),
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
      error: Maybe.nothing(),
    });

    onResetMedia();
    onLoadCourseMediaNextPage(
      mimeFilter, searchText, SORT_MAPPINGS[sortKey].orderBy, SORT_MAPPINGS[sortKey].order);
  }

  renderMediaList() {
    const { media, selectionType, courseModel, resourcePath } = this.props;

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
      nothing: () => Immutable.Map<string, Immutable.List<MediaRef>>(),
    });

    return (
      <div className="media-list">
        <div className="list-header">
          <div className="sel-col" />
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
                    url={webContentsPath(item.pathTo, resourcePath, courseModel.guid)} />
                  {` ${item.fileName}`}
                </div>
                <div className="refs-col">
                  {mediaItemRefs.get(item.guid) && mediaItemRefs.get(item.guid).size}
                </div>
                <div className="date-col">{item.dateUpdated}</div>
                <div className="size-col">{convert.toByteNotation(item.fileSize)}</div>
              </div>
            ))}
            {isLoadingMedia && !allItemsLoaded
              ? <LoadingSpinner key="loading"
                size={LoadingSpinnerSize.Small} message={PAGE_LOADING_MESSAGE} />
              : null
            }
          </div>
        </div>
      </div>
    );
  }

  renderMediaGrid() {
    const { media, selectionType, resourcePath, courseModel } = this.props;

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
                url={webContentsPath(item.pathTo, resourcePath, courseModel.guid)} />
              <div className="name">
                {stringFormat.ellipsize(item.fileName, MAX_NAME_LENGTH, 5)}
              </div>
            </div>
          ))}
        </div>
        {isLoadingMedia && !allItemsLoaded
          ? (
            <div className="loading">
              <i className="fas fa-circle-notch fa-spin fa-1x fa-fw" />
              {PAGE_LOADING_MESSAGE}
            </div>
          )
          : null
        }
      </div>
    );
  }

  renderMediaSelectionDetails() {
    const { media, courseModel, resourcePath } = this.props;
    const { selection, showDetails } = this.state;

    const selectedMediaItems: Immutable.List<MediaItem> = media.caseOf({
      just: ml => selection.map(guid => ml.data.get(guid)) as Immutable.List<MediaItem>,
      nothing: () => Immutable.List<MediaItem>([]),
    });

    const mediaItemRefs = media.caseOf({
      just: ml => ml.references,
      nothing: () => Immutable.Map<string, Immutable.List<MediaRef>>(),
    });

    if (selectedMediaItems.size > 1) {
      return (
        <div className="media-selection-details">
          <div className="details-title">
            Multiple Items Selected
          </div>
        </div>
      );
    }

    if (selectedMediaItems.size > 0) {
      const selectedItem = selectedMediaItems.first();

      return (
        <div className="media-selection-details">
          <div className="details-title">
            <a
              href={webContentsPath(
                selectedItem.pathTo, resourcePath, courseModel.guid)}
              target="_blank"
              onClick={popOpenImage} >
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
                  selectedItem.pathTo, resourcePath, courseModel.guid)} />
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
                <div>
                  <b>References:</b> {
                    mediaItemRefs.get(selectedItem.guid)
                      ? (
                        mediaItemRefs.get(selectedItem.guid).size
                      )
                      : (
                        <i className="fas fa-circle-notch fa-spin fa-1x fa-fw" />
                      )
                  }
                </div>
                <div>
                  {mediaItemRefs.get(selectedItem.guid)
                    && mediaItemRefs.get(selectedItem.guid).map((ref, i) => (
                      <span key={ref.guid}>
                        <a href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            viewActions.viewDocument(
                              ref.resourceId, courseModel.idvers, Maybe.nothing());
                          }}
                          target="_blank">
                          {stringFormat.ellipsize(
                            courseModel.resourcesById.get(ref.resourceId).title, 20, 5)}
                        </a>
                        {i < mediaItemRefs.get(selectedItem.guid).size - 1 ? ', ' : ''}
                      </span>
                    ))
                  }
                </div>
              </div>
            </div>
          }
        </div>
      );
    }
  }

  renderError() {
    const { error } = this.state;

    return error.caseOf({
      just: error => (
        <div className="alert alert-danger fade show" role="alert">
          {error}
        </div>
      ),
      nothing: () => null,
    });
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
        {this.renderError()}
        <div className="media-toolbar">
          <input
            id={id}
            style={{ display: 'none' }}
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
          <div className="media-toolbar-item flex-spacer" />
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
          <div className="flex-spacer" />
          {mediaCount && mediaCount.totalResults > -Infinity &&
            <div>Showing {mediaCount.numResults} of {mediaCount.totalResults}</div>
          }
        </div>
      </div>
    );
  }
}
