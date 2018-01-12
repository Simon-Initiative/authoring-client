import * as React from 'react';

// import './ImageIcon.scss';

export interface ImageIconProps {
  className?: string;
  size: number[];
  filename: string;
  extension: string;
}

/**
 * ImageIcon React Stateless Component
 */
export const ImageIcon: React.StatelessComponent<ImageIconProps> = ({
  className,
  children,
}) => {
  return (
    <div className={`example-component ${className || ''}`}>
      Image
    </div>
  );
};
