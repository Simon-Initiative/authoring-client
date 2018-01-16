import * as React from 'react';
import { FileIcon } from './FileIcon';
import { ImageIcon } from './ImageIcon';
import { isImage } from './utils';

export interface MediaIconProps {
  className?: string;
  filename: string;
  url: string;
}

const getMediaIconRenderer = (extension: string) => {
  if (isImage(extension)) {
    return ImageIcon;
  }

  return FileIcon;
};

/**
 * MediaIcon React Stateless MediaIcon
 */
export const MediaIcon: React.StatelessComponent<MediaIconProps> = ({
  className,
  filename,
  url,
}) => {
  const extensionMatches = filename.match(/\.[^.]+/);
  const extension = extensionMatches ? extensionMatches[0].substr(1, 3).toLowerCase() : '';

  const Icon = getMediaIconRenderer(extension);

  return (
    <div className={`media-icon ${className || ''}`}>
      <Icon filename={filename} extension={extension} url={url} />
    </div>
  );
};
