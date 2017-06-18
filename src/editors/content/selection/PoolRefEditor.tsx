import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import * as persistence from '../../../data/persistence';
import * as models from '../../../data/models';
import { AppServices } from '../../common/AppServices';
import { AbstractContentEditor, 
  AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { Button, Well, Checkbox, Collapse, Select } from '../common/controls';
import guid from '../../../utils/guid';
import { describePool } from './details';
import { RemovableContent } from '../common/RemovableContent';
import ResourceSelection from '../../../utils/selection/ResourceSelection';
import '../common/editor.scss';


export interface PoolRefEditor {
  guid: string;
}

export interface PoolRefProps extends AbstractContentEditorProps<contentTypes.PoolRef> {
  onRemove: (guid: string) => void;
}

export interface PoolRefState {
  title: string;
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
    this.onViewPool = this.onViewPool.bind(this);

    this.state = {
      title: null,
    };
  }

  fetchTitlePoolById(id) {
    
    this.props.services.fetchAttributesBy(['title', 'guid'], 'id', id)
    .then((o) => {
      const { title, guid } = o;
      this.guid = guid;
      this.setState({ title });
    });
  }

  componentDidMount() {
    this.fetchTitlePoolById(this.props.model.idref);
  }
  
  shouldComponentUpdate(nextProps, nextState) {
    return (nextProps.model !== this.props.model || nextState.title !== this.state.title);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.model.idref !== nextProps.model.idref) {
      this.fetchTitlePoolById(nextProps.model.idref);
    }
  }

  onCancel() {
    this.props.services.dismissModal();
  }

  onInsert(resource) {
    this.props.services.dismissModal();

    this.props.services.fetchIdByGuid(resource.id)
    .then(idref => {
      this.props.onEdit(this.props.model.with({ idref }));
    });
  }

  onViewPool() {
    if (this.guid !== null) {
      this.props.services.viewDocument(
        this.guid,
        this.props.context.courseId);
    } 
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
    } else if (this.state.title === null) {
      details = '';
    } else {
      details = <button onClick={this.onViewPool} 
              className="btn btn-link" type="button">{this.state.title}</button>;
    }
    
    return (
      <ul className="list-group">
        <li style={{ paddingBottom: '0.25rem' }} className="list-group-item justify-content-between">
          {details}
          <button disabled={!this.props.editMode} onClick={this.onClick} 
              className="btn btn-primary btn-sm" type="button">Select</button>
        </li>
      </ul>
    );
  }

}

