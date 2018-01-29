import * as React from 'react';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { Button } from 'editors/content/common/Button';
import { MediaIcon } from './MediaIcon';
import { Media, MediaItem } from 'types/media';
import guid from 'utils/guid';
import { stringFormat } from 'utils/format';
import * as persistence from 'data/persistence';
import { AppContext } from 'editors/common/AppContext';
import { OrderedMediaLibrary } from 'editors/content/media/OrderedMediaLibrary';

import './MediaManager.scss';

const PAGELOAD_TRIGGER_MARGIN_PX = 100;
const MAX_NAME_LENGTH = 26;

export enum MIMETYPE_FILTERS {
  IMAGE = 'image',
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
  onEdit: (updated: Media) => void;
  onLoadCourseMediaNextPage: (
    mimeFilter: string, searchText: string,
    orderBy: string, order: string) => void;
  onResetMedia: () => void;
  onSelectionChange: (selection: MediaItem[]) => void;
}

export interface MediaManagerState {
  selection: Immutable.List<string>;
  searchText: string;
  orderBy: string;
  order: string;
  layout: LAYOUTS;
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
    };

    this.onScroll = this.onScroll.bind(this);
    this.isSelected = this.isSelected.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.onChangeLayout = this.onChangeLayout.bind(this);
  }

  componentDidMount() {
    const { mimeFilter, onLoadCourseMediaNextPage } = this.props;
    const { searchText, orderBy, order } = this.state;

    onLoadCourseMediaNextPage(mimeFilter, searchText, orderBy, order);
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
    const { searchText, orderBy, order } = this.state;

    persistence.createWebContent(courseId, file)
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

      // print the path of the media item to the developer console
      console.log('MEDIA MANAGER Selected Item URL: ' + mediaLibrary.getItem(guid).pathTo);
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
      <div className="media-list">
        <div className="list-header">
          <div className="sel-col"/>
          <div className="name-col">Name</div>
          <div className="path-col">Path</div>
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
                  <img src={this.adjust(item.pathTo)} />
                  {` ${item.fileName}`}
                </div>
                <div className="path-col">{item.pathTo}</div>
                <div className="date-col">{item.dateUpdated}</div>
                <div className="size-col">{item.fileSize}</div>
              </div>
            ))}
            {isLoadingMedia && !allItemsLoaded
              ? (
                <div key="loading" className="loading">
                  <i className="fa fa-circle-o-notch fa-spin fa-1x fa-fw" />
                  Hang on while more items are loaded...
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
                  url={this.adjust(item.pathTo)} />
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
              Hang on while more items are loaded...
            </div>
          )
          : null
        }
      </div>
    );
  }

  render() {
    const { className, mimeFilter } = this.props;
    const { searchText, layout, orderBy, order } = this.state;

    const id = guid();

    return (
      <div className={`media-manager ${className || ''}`}>
        <div className="media-toolbar">
            <input
              id={id}
              style={ { display: 'none' } }
              accept={`${mimeFilter}/*`}
              onChange={({ target: { files } }) => this.onFileUpload(files[0])}
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
          </div>
        </div>
      </div>
    );
  }
}
