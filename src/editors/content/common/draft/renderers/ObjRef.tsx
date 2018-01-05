import * as React from 'react';
import {
  InteractiveRenderer, InteractiveRendererProps, InteractiveRendererState,
} from './InteractiveRenderer';

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
