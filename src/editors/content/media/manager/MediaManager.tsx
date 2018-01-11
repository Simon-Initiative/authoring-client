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
  iconUrl: '',
  name: 'Stats1.png',
},{
  mediaType: '',
  mimeType: '',
  iconUrl: '',
  name: 'HelloWorld.docx',
},{
  mediaType: '',
  mimeType: '',
  iconUrl: '',
  name: 'Syllabus.pdf',
},{
  mediaType: '',
  mimeType: '',
  iconUrl: '',
  name: 'Module1.pptx',
},{
  mediaType: '',
  mimeType: '',
  iconUrl: '',
  name: 'Lecture1.pptx',
},{
  mediaType: '',
  mimeType: '',
  iconUrl: '',
  name: 'Sheet.xlsx',
},{
  mediaType: '',
  mimeType: '',
  iconUrl: '',
  name: 'Stats2',
},{
  mediaType: '',
  mimeType: '',
  iconUrl: '',
  name: 'Stats3.png',
}];

const renderMediaGrid = () => {
  return (
    <ol>
      {mediaItems.map(item => (
        <li key={item.name}>
          <MediaIcon size={[56, 56]} filename={item.name} />
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
