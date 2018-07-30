import * as React from 'react';
import * as Immutable from 'immutable';
import { AbstractContentEditor, AbstractContentEditorProps }
  from 'editors/content/common/AbstractContentEditor';
import * as contentTypes from 'data/contentTypes';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { ContentElements } from 'data/content/common/elements';
import { Discoverable, DiscoverableId, FocusAction }
  from 'components/common/Discoverable.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import './DlEditor.scss';
import { Maybe } from 'tsmonad';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { TextInput } from 'editors/content/common/controls';

export interface DtEditorProps extends AbstractContentEditorProps<contentTypes.Dt> {
  onShowSidebar: () => void;
  onDiscover: (id: DiscoverableId) => void;
  label: any;
}

export interface DtEditorState {

}

export default class DtEditor
  extends AbstractContentEditor<contentTypes.Dt, DtEditorProps, DtEditorState> {
  constructor(props) {
    super(props);

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onAddDd = this.onAddDd.bind(this);
    this.onDdEdit = this.onDdEdit.bind(this);
    this.onDtEdit = this.onDtEdit.bind(this);
  }

  onTitleEdit(title: string) {
    this.props.onEdit(
      this.props.model.with({
        title: title === ''
          ? Maybe.nothing()
          : Maybe.just(title),
      }),
      this.props.model);
  }

  onAddDd() {
    const dd = new contentTypes.Dd();
    const model = this.props.model.with({
      definitions: this.props.model.definitions.set(dd.guid, dd),
    });

    this.props.onEdit(model, dd);
  }

  onDdEdit(elements: ContentElements, src) {

    if (elements.content.size > 0) {
      const items = elements
        .content
        .toArray()
        .map(e => [e.guid, e]);

      const model = this.props.model.with({
        definitions: Immutable.OrderedMap<string, contentTypes.Dd>(items),
      });

      this.props.onEdit(model, src);
    }
  }

  onDtEdit(content: ContentElements, src) {
    const model = this.props.model.with({ content });
    this.props.onEdit(model, src);
  }

  renderSidebar(): JSX.Element {
    const { model } = this.props;

    return (
      <SidebarContent title="Term">
        <SidebarGroup label="Title">
          <Discoverable
            id={DiscoverableId.DtEditorTitle}
            focusChild
            focusAction={FocusAction.Focus}>
            <TextInput width="100%" label=""
              editMode={this.props.editMode}
              value={model.title.valueOr('')}
              type="text"
              onEdit={this.onTitleEdit} />
          </Discoverable>
        </SidebarGroup>
      </SidebarContent>
    );
  }

  renderToolbar(): JSX.Element {
    const { onShowSidebar, onDiscover } = this.props;

    return (
      <ToolbarGroup label="Term" columns={3}
        highlightColor={CONTENT_COLORS.Dl}>
        <ToolbarButton
          onClick={() => {
            onShowSidebar();
            onDiscover(DiscoverableId.DtEditorTitle);
          }} size={ToolbarButtonSize.Large}>
          <div><i style={{ textDecoration: 'underline' }}>Abc</i></div>
          <div>Title</div>
        </ToolbarButton>
      </ToolbarGroup>
    );
  }

  renderMain(): JSX.Element {

    const { label, model, editMode } = this.props;

    const definitions = new ContentElements().with({
      content: model.definitions,
      supportedElements: Immutable.List(['dd']),
    });

    const definitionLAbel = (e, i) => <span>{'Definition ' + (i + 1)}</span>;
    const labels = {};
    const bindLabel = el => [{ propertyName: 'label', value: labels[el.guid] }];

    model.definitions.toArray().map((e, i) => labels[e.guid] = definitionLAbel(e, i));

    return (
      <React.Fragment>
        <div className="term__label">{label}</div>
        <div className="term__contents">
          <ContentContainer
            {...this.props}
            model={model.content}
            onEdit={this.onDtEdit}
            hideSingleDecorator />
        </div>
        <div className="term__definitions">
          <ContentContainer
            {...this.props}
            model={definitions}
            onEdit={this.onDdEdit}
            bindProperties={bindLabel}
          />
          <button type="button"
            disabled={!editMode}
            onClick={this.onAddDd}
            className="btn btn-link">+ Add definition</button>
        </div>
      </React.Fragment>
    );
  }
}
