import * as React from 'react';
import { classNames } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';
import { AppContext } from 'editors/common/AppContext';
import { buildUrl } from 'utils/path';
import './Speaker.scss';
import { Maybe } from 'tsmonad';

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
    className, context, model, size = SpeakerSize.Large,
  }) => {

    const src = (model.content.get('image') as Maybe<contentTypes.Image>).caseOf({
      just: image => buildUrl(context.baseUrl,
        context.courseModel.guid,
        context.resourcePath,
        image.src),
      nothing: () => 'https://via.placeholder.com/100x100',
    });

    return (
      <div className={classNames(['speaker', size, className])}>
        <div className="imageContainer">
          <img src={src} alt={model.content.get('name') as string} />
        </div>
        <p>{model.content.get('name') as string}</p>
      </div>
    );
  });
