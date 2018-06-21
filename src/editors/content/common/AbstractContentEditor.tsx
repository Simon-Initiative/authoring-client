import * as React from 'react';
import { AppServices } from 'editors/common/AppServices';
import { AppContext } from 'editors/common/AppContext';
import { ParentContainer, TextSelection } from 'types/active';
import { Maybe } from 'tsmonad';

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
  onEdit: (updated: ModelType, source?: Object) => void;
  onFocus: (
    model: any, parent: ParentContainer,
    textSelection: Maybe<TextSelection>) => void;
  context: AppContext;
  services: AppServices;
  editMode: boolean;
  renderContext?: RenderContext;
  styles?: any;
  activeContentGuid: string;
  hover: string;
  onUpdateHover: (hover: string) => void;
  onHandleClick?: (e) => void;
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

  shouldComponentUpdate(nextProps: AbstractContentEditorProps<ModelType>, nextState) {
    return this.props.model !== nextProps.model
      || this.props.parent !== nextProps.parent
      || this.props.editMode !== nextProps.editMode
      || this.props.styles !== nextProps.styles
      || this.props.activeContentGuid !== nextProps.activeContentGuid
      || this.props.hover !== nextProps.hover;
  }

  abstract renderMain() : JSX.Element;

  abstract renderToolbar() : JSX.Element;

  abstract renderSidebar() : JSX.Element;

  handleOnFocus(e) {

    e.stopPropagation();

    const { model, parent, onFocus } = this.props;
    onFocus(model, parent, Maybe.nothing());
  }

  handleOnClick(e) {

    if (this.props.onHandleClick !== undefined) {
      this.props.onHandleClick(e);
    } else {

      e.stopPropagation();

      const { model, parent, onFocus } = this.props;
      onFocus(model, parent, Maybe.nothing());

    }

  }

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
    return (
      <div onFocus={e => this.handleOnFocus(e)} onClick={e => this.handleOnClick(e)}>
        {this.renderMain()}
      </div>
    );

  }

}
