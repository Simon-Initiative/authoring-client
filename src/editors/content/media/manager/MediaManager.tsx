import * as React from 'react';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { Button } from 'editors/content/common/Button';
import { Dropdown } from 'editors/content/common/Dropdown';
import { MediaIcon } from './MediaIcon';
import { Media, MediaItem } from 'types/media';
import guid from 'utils/guid';
import * as persistence from 'data/persistence';
import { AppContext } from 'editors/common/AppContext';

import './MediaManager.scss';

export interface MediaManagerProps {
  className?: string;
  model: Media;
  onEdit: (updated: Media) => void;
  context: AppContext;
  media: Maybe<Immutable.Map<string, MediaItem>>;
  onLoadCourseMediaNextPage: () => void;
}

/**
 * MediaManager React MediaManager
 */
export class MediaManager extends React.PureComponent<MediaManagerProps> {
  componentDidMount() {
    const { onLoadCourseMediaNextPage } = this.props;

    onLoadCourseMediaNextPage();
  }

  onUploadClick(id: string) {
    (window as any).$('#' + id).trigger('click');
  }

  adjust(path) {
    const { context } = this.props;

    const dirCount = context.resourcePath.split('\/').length;
    let updated = 'webcontents/' + context.courseId + '/' + path;
    for (let i = 0; i < dirCount; i += 1) {
      updated = '../' + updated;
    }

    console.log('updated', updated);

    return updated;
  }

  onFileUpload(file) {
    const { context: { courseId }, model, onEdit } = this.props;

    persistence.createWebContent(courseId, file);
    // .then((result) => {
    //   onEdit(model.with({ src: this.adjust(result) }));
    // })
    // .catch((err) => {
    //   this.setState({ failure: true });
    // });
  }

  renderMediaGrid () {
    const { media } = this.props;

    const mediaItems: MediaItem[] = media.caseOf({
      just: i => i.toArray(),
      nothing: () => [],
    });

    let filenameCache = Immutable.Map<string, string>();
    const getFilename = (path) => {
      if (!filenameCache.has(path)) {
        const pathParts = path.split('/');
        filenameCache = filenameCache.set(path, pathParts[pathParts.length - 1]);
      }

      return filenameCache.get(path);
    };

    return (
      <ol>
        {mediaItems.map(item => (
          <li key={item.guid} className={`media-item ${false ? 'selected' : ''}`}>
            <input
                type="checkbox"
                className="selection-check"
                checked={false} />
            <MediaIcon
                filename={getFilename(item.pathTo)}
                mimeType={item.mimeType}
                url={this.adjust(item.pathTo)} />
            <div className="name">{getFilename(item.pathTo)}</div>
          </li>
        ))}
      </ol>
    );
  }

  render() {
    const { className } = this.props;

    const id = guid();

    return (
      <div className={`media-manager ${className || ''}`}>
        <div className="media-toolbar">
            <input
              id={id}
              style={ { display: 'none' } }
              accept="image/*"
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
                placeholder="Search" />
          </div>
          </div>
        </div>
        <div className="media-content">
          <ol className="media-sidebar">
            <li className="active">All Media</li>
            <li className="">Unit 1</li>
            <li className="">Unit 2</li>
          </ol>
          <div className="media-grid">
            {this.renderMediaGrid()}
          </div>
        </div>
      </div>
    );
  }
}
