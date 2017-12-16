import * as React from 'react';
import PreformattedText from './PreformattedText';
import { InteractiveRenderer, InteractiveRendererProps,
  InteractiveRendererState} from './InteractiveRenderer';
import * as persistence from 'data/persistence';

import { BlockProps } from './properties';
import { Select } from '../../Select';
import { Button } from '../../Button';
import { PurposeTypes } from 'data/content/html/common';
import { handleInsertion } from './common';
import { LegacyTypes } from 'data/types';

import ResourceSelection from 'utils/selection/ResourceSelection';

import './wbinline.scss';

type Data = {
  objref: string;
};

export interface ObjRefProps extends InteractiveRendererProps {
  data: Data;
}

export interface ObjRefState extends InteractiveRendererState {}

export class ObjRef extends InteractiveRenderer<ObjRefProps, ObjRefState> {
  render() : JSX.Element {
    const title = this.props.blockProps.context.courseModel.resourcesById
      .get(this.props.data.objref);

    return (
      <ul className="list-group">
        <li className="list-group-item justify-content-between">
          Learning Objective: {title || 'Loading...'}
        </li>
      </ul>
    );
  }
}
