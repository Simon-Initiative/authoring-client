import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { ContentElements } from 'data/content/common/elements';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { Maybe } from 'tsmonad';
import './DlEditor.scss';
import guid from 'utils/guid';
import { TitleTextEditor } from 'editors/content/learning/contiguoustext/TitleTextEditor';

export interface DefinitionListEditorProps
  extends AbstractContentEditorProps<contentTypes.Dl> {
  onShowSidebar: () => void;
}

export interface DefinitionListEditorState {

}

/**
 * The content editor for definition list.
 */
export default class DefinitionListEditor extends AbstractContentEditor
  <contentTypes.Dl, DefinitionListEditorProps, DefinitionListEditorState> {

  defaultTitle : contentTypes.Title;

  constructor(props) {
    super(props);

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onAddTerm = this.onAddTerm.bind(this);
    this.onTermEdit = this.onTermEdit.bind(this);
    this.defaultTitle = contentTypes.Title.fromText('Title');
  }

  onTitleEdit(ct: contentTypes.ContiguousText, sourceObject) {
    const currentTitle = this.props.model.title.caseOf({
      just: title => title.with({
        text: title.text.with({ content: title.text.content.set(ct.guid, ct) }),
      }), 
      nothing: () => this.defaultTitle.with({
        text: this.defaultTitle.text.with({
          content: this.defaultTitle.text.content.set(ct.guid, ct),
        }),
      }),
    });

    const m = this.props.model.with({ title: Maybe.just(currentTitle) });
    this.props.onEdit(m, sourceObject);
  }

  onAddTerm() {
    // Terms must have at least one associated definition, so attach a default definition
    const definition = new contentTypes.Dd().with({ guid: guid() });
    const term = new contentTypes.Dt().with({
      guid: guid(), definitions: Immutable.OrderedMap<string, contentTypes.Dd>(
        [[definition.guid, definition]],
      ),
    });

    this.props.onEdit(
      this.props.model.with({
        terms: this.props.model.terms.set(term.guid, term),
      }),
      term);
  }

  onTermEdit(elements: ContentElements, src) {
    if (elements.content.size > 0) {
      const items = elements.content.toArray().map(e => [e.guid, e]);

      this.props.onEdit(
        this.props.model.with({
          terms: Immutable.OrderedMap<string, contentTypes.Dt>(items),
        }),
        src);
    }
  }

  renderSidebar() {
    return (
      <SidebarContent title="Definition"></SidebarContent>
    );
  }

  renderToolbar() {
    return (
      <ToolbarGroup label="Definition List" columns={4}
        highlightColor={CONTENT_COLORS.Dl} />
    );
  }

  renderMain(): JSX.Element {

    const { model, editMode } = this.props;


    const terms = new ContentElements().with({
      content: model.terms,
    });

    const termLabel = (e, i) => <span>{'Term ' + (i + 1)}</span>;
    const labels = {};
    const bindLabel = el => [{ propertyName: 'label', value: labels[el.guid] }];

    model.terms.toArray().map((e, i) => labels[e.guid] = termLabel(e, i));

    const title = model.title.caseOf({
      just: t => t,
      nothing: () => this.defaultTitle,
    });

    return (
      <div className="definition-list">
        <TitleTextEditor
          context={this.props.context}
          services={this.props.services}
          onFocus={this.props.onFocus}
          editMode={this.props.editMode}
          model={title.text.content.first() as contentTypes.ContiguousText}
          onEdit={this.onTitleEdit}
          editorStyles={{ fontSize: 20 }} />

        <div className="definition-list__terms">
          <ContentContainer
            {...this.props}
            model={terms}
            onEdit={this.onTermEdit}
            bindProperties={bindLabel} />

          <button type="button"
            disabled={!editMode}
            onClick={this.onAddTerm}
            className="btn btn-link">+ Add term</button>
        </div>
      </div>
    );
  }
}
