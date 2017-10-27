import * as React from 'react';
import PreformattedText from './PreformattedText';
import { InteractiveRenderer, InteractiveRendererProps, 
  InteractiveRendererState} from './InteractiveRenderer';
import * as persistence from '../../../../../data/persistence';

import { BlockProps } from './properties';
import { Select } from '../../Select';
import { Button } from '../../Button';
import { PurposeTypes } from '../../../../../data/content/html/common';
import { handleInsertion } from './common';
import { LegacyTypes } from '../../../../../data/types';

import ResourceSelection from '../../../../../utils/selection/ResourceSelection';

import './wbinline.scss';

type Data = {
  objref: Object;
};

export interface ObjRefProps extends InteractiveRendererProps {
  data: Data;
}

export interface ObjRefState extends InteractiveRendererState {
  title: string;
}

export interface ObjRefProps {
  
}


export class ObjRef extends InteractiveRenderer<ObjRefProps, ObjRefState> {

  constructor(props) {
    super(props, { title: 'Loading...' });
  }

  componentDidMount() {
    this.props.blockProps.services.titleOracle.getTitle(
      this.props.blockProps.context.courseId,
      this.props.data.objref['@idref'],
      'objective',
    )
    .then((title) => {
      this.setState({ title });
    });
  }

  render() : JSX.Element {
    return (
      <ul className="list-group">
        <li className="list-group-item justify-content-between">
          Learning Objective: {this.state.title}
        </li>
      </ul>
    );
  }
}
