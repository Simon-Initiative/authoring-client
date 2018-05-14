import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { injectSheetSFC, classNames } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';
import { styles } from './Speaker.styles';
import './Speaker.scss';
import { AppContext } from 'editors/common/AppContext';
import { buildUrl } from 'utils/path';

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
export const Speaker: React.StatelessComponent<StyledComponentProps<SpeakerProps>>
  = injectSheetSFC<SpeakerProps>(styles)(({
    context, className, classes, children, model, size = SpeakerSize.Large,
  }) => {
    const { title, content } = model;

    const src = content.caseOf({
      just: content =>
        content instanceof contentTypes.Image
          ? buildUrl(context.baseUrl,
                     context.courseId,
                     context.resourcePath,
                     content.src)
          : 'https://via.placeholder.com/100x100',
      nothing: () => 'https://via.placeholder.com/100x100',
    });

    const displayTitle = title.caseOf({
      just: title => title,
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
