import * as React from 'react';
import { get } from 'lodash';
import PreformattedText from './PreformattedText';
import { InteractiveRenderer, InteractiveRendererProps,
  InteractiveRendererState} from './InteractiveRenderer';
import * as persistence from 'app/data/persistence';

import { BlockProps } from './properties';
import { Select } from '../../Select';
import { Button } from '../../Button';
import { PurposeTypes } from 'app/data/content/html/common';
import { handleInsertion } from './common';
import { LegacyTypes } from 'app/data/types';

import ResourceSelection from 'app/utils/selection/ResourceSelection';

import './wbinline.scss';

type Data = {
  objref: Object;
};

export interface ObjRefProps extends InteractiveRendererProps {
  data: Data;
}

export interface ObjRefState extends InteractiveRendererState {}

export class ObjRef extends InteractiveRenderer<ObjRefProps, ObjRefState> {
  render() : JSX.Element {
    const titles = this.props.blockProps.context.titles;
    const courseId = this.props.blockProps.context.courseId;

    return (
      <ul className="list-group">
        <li className="list-group-item justify-content-between">
          Learning Objective: {titles[courseId] || 'Loading...'}
        </li>
      </ul>
    );
  }
}
