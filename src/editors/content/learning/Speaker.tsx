import * as React from 'react';
import * as Immutable from 'immutable';
import { StyledComponentProps } from 'types/component';
import { injectSheetSFC, classNames } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';
import { styles } from './Speaker.styles';
import './Speaker.scss';
import { ContentType } from 'types/messages';

export interface SpeakerProps {
  className?: string;
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
    className, classes, children, model, size = SpeakerSize.Large,
  }) => {
    const { content, title, id } = model;

    const src = content.caseOf({
      just: content =>
        content instanceof contentTypes.Image
          ? content.src
          : 'https://via.placeholder.com/100x100',
      nothing: () => 'https://via.placeholder.com/100x100',
    });

    const defaultName = title.caseOf({
      just: title => title,
      nothing: () => id,
    });

    const speakerName = content.caseOf({
      just: content =>
        content instanceof String
          ? content as string
          : defaultName,
      nothing: () => defaultName,
    });

    return (
      <div className="speaker">
        <div className={classNames([classes.Speaker, size, className])}>
          <div className="imageContainer">
            <img src={src} alt={speakerName} />
          </div>
          <p>{speakerName}</p>
        </div>
      </div>
    );
  });
