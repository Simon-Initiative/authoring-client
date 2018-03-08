import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import DraftWrapper from 'editors/content/common/draft/DraftWrapper';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { ToolbarButton } from 'components/toolbar/ToolbarButton';
import { ToolbarLayoutInline } from 'components/toolbar/ContextAwareToolbar.tsx';
import { InlineStyles } from 'data/content/learning/contiguous';

export interface ContiguousTextEditorProps
  extends AbstractContentEditorProps<contentTypes.ContiguousText> {

}

export interface ContiguousTextEditorState {


}

/**
 * The content editor for contiguous text.
 */
export default class ContiguousTextEditor
  extends AbstractContentEditor<contentTypes.ContiguousText,
    ContiguousTextEditorProps, ContiguousTextEditorState> {

  constructor(props) {
    super(props);

  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    if (nextProps.context !== this.props.context) {
      return true;
    }
    return false;
  }

  renderSidebar() {
    return null;
  }

  renderToolbar() {
    const { model, onEdit } = this.props;

    return (
      <React.Fragment>
        <ToolbarLayoutInline>
          <ToolbarButton
              onClick={() => {
                onEdit(model.toggleStyle(InlineStyles.Term));
              }}
              tooltip="Term">
            <i className={'fa fa-book'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={() => {
                onEdit(model.toggleStyle(InlineStyles.Foreign));
              }}
              tooltip="Foreign">
            <i className={'fa fa-globe'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={() => console.log('NOT IMPLEMENTED')}
              tooltip="Quotation">
            <i className={'fa fa-quote-right'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={() => console.log('NOT IMPLEMENTED')}
              tooltip="Citation">
            <i className={'fa fa-asterisk'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={() => console.log('NOT IMPLEMENTED')}
              tooltip="External Hyperlink">
            <i className={'fa fa-external-link'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={() => console.log('NOT IMPLEMENTED')}
              tooltip="High Stakes Assessment Link">
            <i className={'fa fa-check'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={() => console.log('NOT IMPLEMENTED')}
              tooltip="Cross Reference Link">
            <i className={'fa fa-map-signs'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={() => console.log('NOT IMPLEMENTED')}
              tooltip="Ordered List">
            <i className={'fa fa-list-ol'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={() => console.log('NOT IMPLEMENTED')}
              tooltip="Unordered List">
            <i className={'fa fa-list-ul'}/>
          </ToolbarButton>
        </ToolbarLayoutInline>
      </React.Fragment>
    );
  }

  renderMain() : JSX.Element {

    const ignoreSelection = () => {};

    return (
      <div className="contiguous-text">

          <DraftWrapper
            activeItemId=""
            editorStyles={{}}
            onSelectionChange={ignoreSelection}
            services={this.props.services}
            context={this.props.context}
            content={this.props.model}
            undoRedoGuid={this.props.context.undoRedoGuid}
            locked={!this.props.editMode}
            onEdit={c => this.props.onEdit(c, c)} />

      </div>);
  }

}

