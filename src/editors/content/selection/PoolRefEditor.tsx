import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import * as persistence from '../../../data/persistence';
import * as models from '../../../data/models';
import { AppServices } from '../../common/AppServices';
import { AbstractContentEditor, 
  AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { TextInput, InlineForm, Button, Checkbox, Collapse, Select } from '../common/controls';
import guid from '../../../utils/guid';
import { describePool } from './details';
import { RemovableContent } from '../common/RemovableContent';
import ResourceSelection from '../../../utils/selection/ResourceSelection';
import '../common/editor.scss';


export interface PoolRefEditor {
  
}

export interface PoolRefProps extends AbstractContentEditorProps<contentTypes.PoolRef> {
  onRemove: (guid: string) => void;
}

export interface PoolRefState {
  pool: contentTypes.Pool;
}


/**
 * The content editor for HtmlContent.
 */
export class PoolRefEditor 
  extends AbstractContentEditor<contentTypes.PoolRef, PoolRefProps, PoolRefState> {
    
  constructor(props) {
    super(props);
    
    this.onInsert = this.onInsert.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onClick = this.onClick.bind(this);

    this.state = {
      pool: null,
    };
  }

  componentDidMount() {
    if (this.props.model.idref !== '') {
      persistence.retrieveDocument(this.props.context.courseId, this.props.model.idref)
      .then((document) => {
        if (document.model.modelType === 'PoolModel') {
          this.setState({ pool: document.model.pool });
        }
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (nextProps.model !== this.props.model || nextState.pool !== this.state.pool);
  }

  onCancel() {
    this.props.services.dismissModal();
  }

  onInsert(resource) {
    this.props.services.dismissModal();

    this.props.onEdit(this.props.model.with({ idref: resource.id }));
  }

  onClick() {

    const predicate =
      (res: persistence.CourseResource) : boolean => {
        return res.type === 'x-oli-assessment2-pool';
      };

    this.props.services.displayModal(
        <ResourceSelection
          filterPredicate={predicate}
          courseId={this.props.context.courseId}
          onInsert={this.onInsert} 
          onCancel={this.onCancel}/>);
  }

  render() : JSX.Element {

    let details;
    if (this.props.model.idref === '') {
      details = 'No external pool selected';
    } else if (this.state.pool === null) {
      details = '';
    } else {
      details = describePool(this.state.pool);
    }
    
    return (
      <div>
        <div className="input-group">
          <input type="text" className="form-control" value={details} disabled/>
          <span className="input-group-btn">
            <button onClick={this.onClick} 
              className="btn btn-primary" type="button">Select</button>
          </span>
        </div>
      </div>
    );
  }

}

