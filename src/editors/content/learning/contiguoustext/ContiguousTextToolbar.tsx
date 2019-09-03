import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { withStyles } from 'styles/jss';
import {
  AbstractContentEditor, AbstractContentEditorProps, RenderContext,
} from 'editors/content/common/AbstractContentEditor';
import { ToolbarButton } from 'components/toolbar/ToolbarButton';
import { ToolbarGroup, ToolbarLayout, determineBaseUrl }
  from 'components/toolbar/ContextAwareToolbar';
import {
  ToolbarNarrowMenu,
  ToolbarButtonMenuItem,
} from 'components/toolbar/ToolbarButtonMenu';
import { InlineStyles, InlineTypes } from 'data/content/learning/contiguous';
import { getEditorByContentType } from 'editors/content/container/registry';
import { TextSelection } from 'types/active';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { entryInstances } from 'editors/content/learning/bibliography/utils';
import { CONTENT_COLORS, getContentIcon, insertableContentTypes } from
  'editors/content/utils/content';
import { selectImage } from 'editors/content/learning/ImageEditor';
import { Resource, ResourceState } from 'data/content/resource';
import { CourseModel } from 'data/models/course';
import {
  selectTargetElement,
} from 'components/message/selection';
import { ContentElements, EXTRA_ELEMENTS } from 'data/content/common/elements';
import createGuid from 'utils/guid';
import { styles } from './ContiguousText.styles';
import { Maybe } from 'tsmonad';
import { ContentElement } from 'data/content/common/interfaces';
import EntryList from 'editors/content/bibliography/EntryList';
import ModalSelection from 'utils/selection/ModalSelection';
import { StyledComponentProps } from 'types/component';
import { LegacyTypes } from 'data/types';
import { PLACEHOLDER_ITEM_ID } from 'data/content/org/common';
import { Editor } from 'slate';
import * as editorUtils from './utils';

export interface ContiguousTextToolbarProps
  extends AbstractContentEditorProps<contentTypes.ContiguousText> {
  courseModel: CourseModel;
  resource: Resource;
  onDisplayModal: (component) => void;
  onDismissModal: () => void;
  onAddEntry: (e, documentId) => Promise<void>;
  onFetchContentElementByPredicate: (documentId, predicate) => Promise<Maybe<ContentElement>>;
  selection: TextSelection;
  editor: Maybe<Editor>;
}

export interface ContiguousTextToolbarState {

}

type StyledContiguousTextToolbarProps =
  StyledComponentProps<ContiguousTextToolbarProps, typeof styles>;

function applyInline(editor: Maybe<Editor>, wrapper: InlineTypes) {
  editor.lift(e => editorUtils.applyInline(e, wrapper));
}
function insertInline(editor: Maybe<Editor>, wrapper: InlineTypes) {
  editor.lift(e => editorUtils.insertInline(e, wrapper));
}

function selectBibEntry(bib: contentTypes.Bibliography, display, dismiss)
  : Promise<Maybe<contentTypes.Entry>> {
  return new Promise((resolve, reject) => {

    const selected = { entry: Maybe.nothing() };

    const bibPicker = (
      <ModalSelection title="Select a bibliography entry"
        onInsert={() => { dismiss(); resolve(selected.entry as Maybe<contentTypes.Entry>); }}
        onCancel={() => { dismiss(); resolve(Maybe.nothing()); }}>
        <EntryList
          model={bib.bibEntries.toList()}
          onSelectEntry={e => selected.entry = Maybe.just(e)}
        />
      </ModalSelection>
    );

    display(bibPicker);
  });
}

/**
 * The content editor for contiguous text.
 */
class ContiguousTextToolbar
  extends AbstractContentEditor<contentTypes.ContiguousText,
  StyledContiguousTextToolbarProps, ContiguousTextToolbarState> {

  constructor(props) {
    super(props);

  }

  shouldComponentUpdate(nextProps: StyledContiguousTextToolbarProps, nextState) {
    return super.shouldComponentUpdate(nextProps, nextState)
      || nextProps.selection !== this.props.selection;
  }

  renderActiveEntity(entity) {

    const { key, data } = entity;

    const model = this.props.model;
    const onCtEdit = this.props.onEdit;

    const props = {
      ...this.props,
      renderContext: RenderContext.Sidebar,
      onFocus: (c, p) => true,
      model: data,
      onEdit: (updated) => {
        this.props.editor.lift((e) => {
          onCtEdit(model.updateInlineData(key, updated));
        });
      },
    };

    return React.createElement(
      getEditorByContentType((data as any).contentType), props);

  }

  renderSidebar() {
    const { model, selection } = this.props;

    const entity = selection.isCollapsed()
      ? model.getEntityAtCursor().caseOf({ just: n => n, nothing: () => null })
      : null;

    if (entity !== null) {
      return this.renderActiveEntity(entity);
    }
    return <SidebarContent title="Text Block" />;
  }

  renderEntryOptions(selection) {

    const addCitationWithEntry = (id) => {
      insertInline(this.props.editor, new contentTypes.Cite().with({ entry: id }));
    };

    const createCitationForExistingEntry = () => {
      this.props.onFetchContentElementByPredicate(
        this.props.context.documentId,
        e => e.contentType === 'Bibliography')
        .then((maybeBib) => {
          maybeBib.lift((bib) => {
            selectBibEntry(
              bib as contentTypes.Bibliography,
              this.props.onDisplayModal, this.props.onDismissModal)
              .then((maybeEntry) => {
                maybeEntry.lift(e => addCitationWithEntry(e.id));
              });
          });
        });
    };

    const addNewBibEntry = (e) => {

      const withId = e.with({ id: createGuid() });

      this.props.onAddEntry(withId, this.props.context.documentId);

      // This is a hack - but I was having problems bridging the onEdit based mutation
      // with the dispatched based mutation
      setTimeout(
        () => {
          insertInline(this.props.editor, new contentTypes.Cite().with({ entry: withId.id }));
        },
        100);

    };

    const buttons = Object.keys(entryInstances).map((key) => {
      return (
        <ToolbarButtonMenuItem
          disabled={false}
          onClick={() => addNewBibEntry(entryInstances[key])}>
          {key}
        </ToolbarButtonMenuItem>
      );
    });

    return (
      <div style={{ backgroundColor: 'white', margin: '8px' }}>
        <ToolbarButtonMenuItem
          disabled={false}
          onClick={() => createCitationForExistingEntry()}>
          Cite existing entry...
        </ToolbarButtonMenuItem>
        <div className="dropdown-divider"></div>
        <h6 className="dropdown-header">Cite new entry</h6>
        {buttons}
      </div>
    );
  }

  renderToolbar() {

    const { model, onEdit, editMode, selection, editor } = this.props;
    const supports = el => this.props.parent.supportedElements.contains(el);

    const currentMarks = model.value.activeMarks.toArray().map(m => m.type);
    const currentInlines = model.value.inlines;

    const noTextSelected = selection && selection.isCollapsed();

    const bareTextSelected = selection && selection.isCollapsed()
      ? false
      : currentInlines.size === 0;

    // We enable the bdo button only when there is a selection that
    // doesn't overlap an entity, and that selection selects only
    // bare text or just another bdo
    const onlyBdoOrEmpty = currentMarks.length === 0
      || (currentMarks.length === 1 && (currentMarks.indexOf('bdo') >= 0));

    const bdoDisabled = !selection || selection.isCollapsed()
      || currentInlines.size > 0
      || !onlyBdoOrEmpty;

    const cursorInEntity = selection && selection.isCollapsed()
      ? model.getEntityAtCursor().caseOf({ just: n => true, nothing: () => false })
      : false;

    const rangeEntitiesEnabled = editMode && bareTextSelected;
    const pointEntitiesEnabled = editMode && !cursorInEntity && noTextSelected;

    return (
      <ToolbarGroup
        label="Text Block" highlightColor={CONTENT_COLORS.ContiguousText} columns={13.4}>
        <ToolbarLayout.Inline>
          <ToolbarButton
            onClick={
              () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Bold))
            }
            disabled={!supports('em') || !editMode}
            tooltip="Bold">
            <i className={'fa fa-bold'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Italic))
            }
            disabled={!supports('em') || !editMode}
            tooltip="Italic">
            <i className={'fa fa-italic'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Strikethrough))
            }
            disabled={!supports('em') || !editMode}
            tooltip="Strikethrough">
            <i className={'fa fa-strikethrough'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Highlight))
            }
            disabled={!supports('em') || !editMode}
            tooltip="Highlight">
            <i className={'fas fa-pencil-alt'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Superscript))
            }
            disabled={!supports('sup') || !editMode}
            tooltip="Superscript">
            <i className={'fa fa-superscript'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Subscript))
            }
            disabled={!supports('sub') || !editMode}
            tooltip="Subscript">
            <i className={'fa fa-subscript'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Var))
            }
            disabled={!supports('code') || !editMode}
            tooltip="Code">
            {getContentIcon(insertableContentTypes.BlockCode)}
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Term))
            }
            disabled={!supports('term') || !editMode}
            tooltip="Term">
            <i className={'fa fa-book'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Foreign))
            }
            disabled={!supports('foreign') || !editMode}
            tooltip="Foreign">
            <i className={'fa fa-globe'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => this.props.editor.lift(e => e.toggleMark(InlineStyles.BidirectionTextOverride))
            }
            disabled={!supports('bdo') || bdoDisabled || !editMode}
            tooltip="Reverse Text Direction">
            <i className={'fa fa-angle-left'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => {
                applyInline(this.props.editor, new contentTypes.Quote());
              }
            }
            disabled={!supports('quote') || !rangeEntitiesEnabled}
            tooltip="Quotation">
            <i className={'fa fa-quote-right'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => {
                applyInline(this.props.editor, new contentTypes.Link());
              }
            }
            disabled={!supports('link') || !rangeEntitiesEnabled}
            tooltip="Hyperlink">
            <i className={'fa fa-link'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => {
                const material = contentTypes.Material.fromText('Sample definition', '');
                const m = new contentTypes.Meaning().with({ material });
                const extra = new contentTypes.Extra().with({
                  meaning: Immutable.OrderedMap<string, contentTypes.Meaning>().set(m.guid, m),
                });

                applyInline(this.props.editor, extra);
              }
            }
            disabled={!supports('extra') || !rangeEntitiesEnabled}
            tooltip="Rollover Definition">
            <i className={'fa fa-book'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => {
                const extra = new contentTypes.Extra().with({
                  content: ContentElements.fromText('Sample content', '', EXTRA_ELEMENTS),
                });
                applyInline(this.props.editor, extra);
              }
            }
            disabled={!supports('extra') || !rangeEntitiesEnabled}
            tooltip="Rollover Content">
            <i className={'far fa-address-book'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => {
                applyInline(this.props.editor, new contentTypes.ActivityLink());
              }
            }
            disabled={!supports('activity_link') || !rangeEntitiesEnabled}
            tooltip="High Stakes Assessment Link">
            <i className={'fa fa-check'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => {

                const thisId = this.props.context.courseModel.resourcesById.get(
                  this.props.context.documentId).id;

                const pages = this.props.context.courseModel.resources
                  .toArray()
                  .filter(r => r.type === LegacyTypes.workbook_page &&
                    r.id !== thisId &&
                    r.id !== PLACEHOLDER_ITEM_ID &&
                    r.resourceState !== ResourceState.DELETED);

                const xrefDefault = pages[0] ? pages[0].id : thisId;

                if (pages.length > 0) {
                  applyInline(this.props.editor,
                    new contentTypes.Xref({ page: xrefDefault, idref: xrefDefault }));
                }
              }
            }
            disabled={!supports('xref') || !rangeEntitiesEnabled}
            tooltip="Cross Reference Link">
            <i className={'fa fa-map-signs'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => {
                insertInline(this.props.editor, new contentTypes.Math());
              }
            }
            disabled={!supports('m:math') || !pointEntitiesEnabled}
            tooltip="MathML or Latex formula">
            {getContentIcon(insertableContentTypes.Math)}
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => {
                insertInline(this.props.editor, new contentTypes.Sym());
              }
            }
            disabled={!supports('sym') || !pointEntitiesEnabled}
            tooltip="HTML Entity or Symbol">
            <i className={'fa fa-circle'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {
              selectImage(
                null, determineBaseUrl(this.props.resource), this.props.courseModel,
                this.props.onDisplayModal, this.props.onDismissModal)
                .then((image) => {
                  if (image !== null) {
                    insertInline(this.props.editor, image);
                  }
                });
            }}
            tooltip="Insert Image"
            disabled={!supports('image') || !pointEntitiesEnabled}>
            {getContentIcon(insertableContentTypes.Image)}
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {

              const selectionSnapshot = selection;

              model.extractParagraphSelectedText(selection).lift((title) => {
                selectTargetElement()
                  .then((e) => {
                    e.lift((element) => {
                      const command = new contentTypes.Command()
                        .with({ target: element.id, title });
                      applyInline(this.props.editor, command);
                    });
                  });
              });

            }}
            tooltip="Insert Command"

            // We work around the limitation of the element spec
            // by allowing commands whereever links are allowed
            disabled={!supports('link') || !rangeEntitiesEnabled}>

            {getContentIcon(insertableContentTypes.Command)}
          </ToolbarButton>
          <ToolbarNarrowMenu
            icon={<i className={'fa fa-asterisk'} />}
            label={''}
            tooltip="Insert Citation"
            disabled={!supports('cite') || !pointEntitiesEnabled}>

            {this.renderEntryOptions(selection)}
          </ToolbarNarrowMenu>
        </ToolbarLayout.Inline>
      </ToolbarGroup >
    );
  }

  renderMain(): JSX.Element {
    return null;
  }

}

const StyledContiguousTextToolbar = withStyles<ContiguousTextToolbarProps>(styles)
  (ContiguousTextToolbar);
export default StyledContiguousTextToolbar;
