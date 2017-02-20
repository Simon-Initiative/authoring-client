'use strict'

import * as React from 'react';

import * as persistence from '../data/persistence';
import { document as documentActions } from '../actions/document';

import { getEditorByName } from './registry';

interface EditorFactory {
  onSelect: (id) => void;
}

export interface EditorFactoryProps {
  documentId: string;
  dispatch: any;
}

class EditorFactory extends React.Component<EditorFactoryProps, { document: persistence.Document}> {

  constructor(props) {
    super(props);

    this.state = { document: null};
    this.onSelect = (id) => {
      this.props.dispatch(documentActions.viewDocument(id));
    }
  }

  fetchDocument(documentId: string) {
    persistence.retrieveDocument(documentId)
      .then(document => this.setState({document}))
      .catch(err => console.log(err));
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.documentId !== nextProps.documentId) {
      this.fetchDocument(nextProps.documentId);
    }
  }

  componentDidMount() {
    this.fetchDocument(this.props.documentId);
  }  

  render() : JSX.Element {
    if (this.state.document === null) {
      return null;
    } else {
      let component = getEditorByName(this.state.document.metadata.type);
      let childProps = Object.assign({}, this.props, {document: this.state.document});
      return React.createElement( (component as any), childProps);
    }
  }
  

}

export default EditorFactory;
