import * as React from 'react';
import { AppServices } from 'editors/common/AppServices';
import { AppContext } from 'editors/common/AppContext';
import { ParentContainer } from 'types/active';

export interface AbstractContentEditor<ModelType, P extends AbstractContentEditorProps<ModelType>,
  S extends AbstractContentEditorState> {}

export enum RenderContext {
  MainEditor,
  Toolbar,
  Sidebar,
}

export interface AbstractContentEditorProps<ModelType> {
  model: ModelType;
  parent?: ParentContainer;
  activeContentGuid?: string;
  onEdit: (updated: ModelType, source?: Object) => void;
  onFocus: (model: any, parent) => void;
  context: AppContext;
  services: AppServices;
  editMode: boolean;
  renderContext?: RenderContext;
  styles?: any;
}

export interface AbstractContentEditorState {}

/**
 * The abstract content editor.
 */
export abstract class
  AbstractContentEditor
    <ModelType, P extends AbstractContentEditorProps<ModelType>,
    S extends AbstractContentEditorState> extends React.Component<P, S> {

  constructor(props) {
    super(props);
  }

  // Force concrete classes to implement their own logic
  abstract shouldComponentUpdate(nextProps, nextState);

  abstract renderMain() : JSX.Element;

  abstract renderToolbar() : JSX.Element;

  abstract renderSidebar() : JSX.Element;

  render() : JSX.Element {

    const renderContext = this.props.renderContext === undefined
      ? RenderContext.MainEditor
      : this.props.renderContext;

    if (renderContext === RenderContext.Toolbar) {
      return this.renderToolbar();
    }
    if (renderContext === RenderContext.Sidebar) {
      return this.renderSidebar();
    }
    return this.renderMain();

  }

}
