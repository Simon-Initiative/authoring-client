import * as React from 'react';
import { FileIcon } from './FileIcon';
import { ImageIcon } from './ImageIcon';
import { isImage } from './utils';

export interface MediaIconProps {
  className?: string;
  size: number[];
  filename: string;
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
  size,
  filename,
}) => {
  const extensionMatches = filename.match(/\.[^.]+/);
  const extension = extensionMatches ? extensionMatches[0].substr(1, 3).toLowerCase() : '';

  const Icon = getMediaIconRenderer(extension);

  return (
    <div className={`media-icon ${className || ''}`}>
      <Icon size={size} filename={filename} extension={extension} />
    </div>
  );
};
