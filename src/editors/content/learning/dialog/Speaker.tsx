import * as React from 'react';
import { classNames } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';
import { AppContext } from 'editors/common/AppContext';
import { buildUrl } from 'utils/path';
import './Speaker.scss';

export interface SpeakerProps {
  className?: string;
  context: AppContext;
  model: contentTypes.Speaker;
  size?: SpeakerSize;
}

export enum SpeakerSize {
  Large = 'large',
  Small = 'small',
}

/**
 * Speaker React Stateless Component
 */
export const Speaker: React.StatelessComponent<SpeakerProps>
  = (({
    className, context, children, model, size = SpeakerSize.Large,
  }) => {
    const { content } = model;

    const src = content.caseOf({
      just: content =>
        content instanceof contentTypes.Image
          ? buildUrl(context.baseUrl,
            context.courseModel.guid,
            context.resourcePath,
            content.src)
          : 'https://via.placeholder.com/100x100',
      nothing: () => 'https://via.placeholder.com/100x100',
    });

    const displayTitle = content.caseOf({
      just: c => c instanceof contentTypes.Image
        ? 'Speaker'
        : c,
      nothing: () => 'Speaker',
    });

    return (
      <div className={classNames(['speaker', size, className])}>
        <div className="imageContainer">
          <img src={src} alt={displayTitle} />
        </div>
        <p>{displayTitle}</p>
      </div>
    );
  });
