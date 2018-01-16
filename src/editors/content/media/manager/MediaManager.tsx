import * as React from 'react';
import * as Immutable from 'immutable';
import { Button } from 'editors/content/common/Button';
import { Dropdown } from 'editors/content/common/Dropdown';
import { MediaIcon } from './MediaIcon';

import './MediaManager.scss';

export interface MediaManagerProps {
  className?: string;
}

const onEditClick = () => {
  console.log('NOT IMPLEMENTED');
};

const mediaItems = [{
  mediaType: '',
  mimeType: '',
  url: 'http://ichef.bbci.co.uk/wwfeatures/wm/live/1280_640/images/live/p0/2v/dp/p02vdpfn.jpg',
  name: 'Stats1.png',
  selected: false,
},{
  mediaType: '',
  mimeType: '',
  url: '',
  name: 'Hello sdfasdf asasdf asfa sad sas dfasf asdf sdfa.docx',
  selected: false,
},{
  mediaType: '',
  mimeType: '',
  url: '',
  name: 'Syllabus.pdf',
  selected: false,
},{
  mediaType: '',
  mimeType: '',
  url: '',
  name: 'Module1.zip',
  selected: false,
},{
  mediaType: '',
  mimeType: '',
  url: '',
  name: 'Lecture1.pptx',
  selected: false,
},{
  mediaType: '',
  mimeType: '',
  url: '',
  name: 'Sheet.xlsx',
  selected: true,
},{
  mediaType: '',
  mimeType: '',
  url: '',
  name: 'Stats2',
  selected: false,
},{
  mediaType: '',
  mimeType: '',
  url: 'http://www.startupremarkable.com/wp-content/uploads/2015/02/a-book-a-week-image.jpg',
  name: 'Stats3.png',
  selected: true,
},{
  mediaType: '',
  mimeType: '',
  url: '',
  name: 'Stats4.txt',
  selected: false,
},{
  mediaType: '',
  mimeType: '',
  url: '',
  name: 'Lecture1.pptx',
  selected: false,
},{
  mediaType: '',
  mimeType: '',
  url: '',
  name: 'Sheet.xlsx',
  selected: true,
},{
  mediaType: '',
  mimeType: '',
  url: '',
  name: 'Stats2',
  selected: false,
},{
  mediaType: '',
  mimeType: '',
  url: 'http://www.startupremarkable.com/wp-content/uploads/2015/02/a-book-a-week-image.jpg',
  name: 'Stats3.png',
  selected: true,
},{
  mediaType: '',
  mimeType: '',
  url: '',
  name: 'Stats4.txt',
  selected: false,
},{
  mediaType: '',
  mimeType: '',
  url: '',
  name: 'Lecture1.pptx',
  selected: false,
},{
  mediaType: '',
  mimeType: '',
  url: '',
  name: 'Sheet.xlsx',
  selected: true,
},{
  mediaType: '',
  mimeType: '',
  url: '',
  name: 'Stats2',
  selected: false,
},{
  mediaType: '',
  mimeType: '',
  url: 'http://www.startupremarkable.com/wp-content/uploads/2015/02/a-book-a-week-image.jpg',
  name: 'Stats3.png',
  selected: true,
},{
  mediaType: '',
  mimeType: '',
  url: '',
  name: 'Stats4.txt',
  selected: false,
},{
  mediaType: '',
  mimeType: '',
  url: '',
  name: 'file.css',
  selected: false,
},{
  mediaType: '',
  mimeType: '',
  url: '',
  name: 'file.js',
  selected: false,
}];

const renderMediaGrid = () => {
  return (
    <ol>
      {mediaItems.map(item => (
        <li key={item.name} className={`media-item ${item.selected ? 'selected' : ''}`}>
          <input
              type="checkbox"
              className="selection-check"
              value={`${item.selected}`} />
          <MediaIcon filename={item.name} url={item.url} />
          <div className="name">{item.name}</div>
        </li>
      ))}
    </ol>
  );
};

/**
 * MediaManager React MediaManager
 */
export const MediaManager: React.StatelessComponent<MediaManagerProps> = ({
  className,
}) => {
  return (
    <div className={`media-manager ${className || ''}`}>
      <div className="media-toolbar">
        <Button
            className="media-toolbar-item upload"
            editMode
            onClick={onEditClick}>
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
          {renderMediaGrid()}
        </div>
      </div>
    </div>
  );
};
