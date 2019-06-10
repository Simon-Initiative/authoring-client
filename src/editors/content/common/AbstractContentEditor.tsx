import * as React from 'react';
import { AppServices } from 'editors/common/AppServices';
import { AppContext } from 'editors/common/AppContext';
import { ParentContainer, TextSelection } from 'types/active';
import { Maybe } from 'tsmonad';
import { ContentElement } from 'data/content/common/interfaces';
import { JSSStyles } from 'styles/jss';

export interface AbstractContentEditor<ModelType, P extends AbstractContentEditorProps<ModelType>,
  S extends AbstractContentEditorState> { }

export enum RenderContext {
  MainEditor,
  Toolbar,
  Sidebar,
}

export interface AbstractContentEditorProps<ModelType> {
  model: ModelType;
  parent?: ParentContainer;
  onEdit: (updated: ModelType, source?: ContentElement) => void;
  onFocus: (
    model: any, parent: ParentContainer,
    textSelection: Maybe<TextSelection>) => void;
  context: AppContext;
  services: AppServices;
  editMode: boolean;
  renderContext?: RenderContext;
  styles?: JSSStyles;
  activeContentGuid: string;
  hover: string;
  onUpdateHover: (hover: string) => void;
  onHandleClick?: (e: React.MouseEvent<HTMLElement>) => void;

  // Callback for selection of and the current active selected entity.
  // These are only used by the ContiguousTextEditor components, but
  // must exist here at this level so that these props can be passed
  // through non CTE elements (like a Table) to child CTEs.
  onEntitySelected?: (key: string, data: Object) => void;
  selectedEntity?: Maybe<string>;
}

export interface AbstractContentEditorState { }

/**
 * The abstract content editor.
 */
export abstract class
  AbstractContentEditor
  <ModelType, P extends AbstractContentEditorProps<ModelType>,
  S extends AbstractContentEditorState> extends React.Component<P, S> {

  constructor(props: P) {
    super(props);
  }

  shouldComponentUpdate(nextProps: P, nextState: S) {
    return this.props.model !== nextProps.model
      || this.props.parent !== nextProps.parent
      || this.props.editMode !== nextProps.editMode
      || this.props.styles !== nextProps.styles
      || this.props.activeContentGuid !== nextProps.activeContentGuid
      || this.props.selectedEntity !== nextProps.selectedEntity
      || this.props.hover !== nextProps.hover;
  }

  abstract renderMain(): JSX.Element;

  abstract renderToolbar(): JSX.Element;

  abstract renderSidebar(): JSX.Element;

  handleOnFocus(e: React.FocusEvent<HTMLElement>) {

    e.stopPropagation();

    const { model, parent, onFocus } = this.props;
    onFocus(model, parent, Maybe.nothing());
  }

  handleOnClick(e: React.MouseEvent<HTMLElement>) {

    if (this.props.onHandleClick !== undefined) {
      this.props.onHandleClick(e);
    } else {

      e.stopPropagation();

      const { model, parent, onFocus } = this.props;
      onFocus(model, parent, Maybe.nothing());

    }

  }

  render(): JSX.Element {

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
      <div onFocus={(e: React.FocusEvent<HTMLDivElement>) => this.handleOnFocus(e)}
        onClick={e => this.handleOnClick(e)}>
        {this.renderMain()}
      </div>
    );

  }

}
