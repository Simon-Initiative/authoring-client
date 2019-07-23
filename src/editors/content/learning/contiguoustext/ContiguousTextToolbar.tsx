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
import { InlineStyles } from 'data/content/learning/contiguous';
import { EntityTypes } from 'data/content/learning/common';
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

export interface ContiguousTextToolbarProps
  extends AbstractContentEditorProps<contentTypes.ContiguousText> {
  courseModel: CourseModel;
  resource: Resource;
  onDisplayModal: (component) => void;
  onDismissModal: () => void;
  onAddEntry: (e, documentId) => Promise<void>;
  onFetchContentElementByPredicate: (documentId, predicate) => Promise<Maybe<ContentElement>>;
  selection: TextSelection;
}

export interface ContiguousTextToolbarState {

}

type StyledContiguousTextToolbarProps =
  StyledComponentProps<ContiguousTextToolbarProps, typeof styles>;

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

    const props = {
      ...this.props,
      renderContext: RenderContext.Sidebar,
      onFocus: (c, p) => true,
      model: data,
      onEdit: (updated) => {

        // We special case the command entity updates as they need
        // to update both the data backing the entity and the text
        // that is displayed
        const updatedModel = updated.contentType === 'Command'
          ? this.props.model.replaceEntity(key, EntityTypes.command, false, updated, updated.title)
          : this.props.model.updateEntity(key, updated);

        this.props.onEdit(updatedModel, updated);
      },
    };

    return React.createElement(
      getEditorByContentType((data as any).contentType), props);

  }

  renderSidebar() {
    const { model, selection } = this.props;

    const entity = selection.isCollapsed()
      ? model.getEntityAtCursor(selection).caseOf({ just: n => n, nothing: () => null })
      : null;

    if (entity !== null) {
      return this.renderActiveEntity(entity);
    }
    return <SidebarContent title="Text Block" />;
  }

  renderEntryOptions(selection) {

    const addCitationWithEntry = (id) => {
      this.props.onEdit(this.props.model.addEntity(
        EntityTypes.cite, true, new contentTypes.Cite().with({ entry: id }), selection));
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
          this.props.onEdit(this.props.model.addEntity(
            EntityTypes.cite, true, new contentTypes.Cite().with({ entry: withId.id }), selection));
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

    const { model, onEdit, editMode, selection } = this.props;
    const supports = el => this.props.parent.supportedElements.contains(el);

    const noTextSelected = selection && selection.isCollapsed();

    const bareTextSelected = selection && selection.isCollapsed()
      ? false
      : !model.selectionOverlapsEntity(selection);

    // We enable the bdo button only when there is a selection that
    // doesn't overlap an entity, and that selection selects only
    // bare text or just another bdo
    const intersectingStyles = model.getOverlappingInlineStyles(selection);
    const onlyBdoOrEmpty = intersectingStyles.size === 0
      || (intersectingStyles.size === 1 && intersectingStyles.contains('BDO'));

    const bdoDisabled = !selection || selection.isCollapsed()
      || model.selectionOverlapsEntity(selection)
      || !onlyBdoOrEmpty;

    const cursorInEntity = selection && selection.isCollapsed()
      ? model.getEntityAtCursor(selection).caseOf({ just: n => true, nothing: () => false })
      : false;

    const rangeEntitiesEnabled = editMode && bareTextSelected;
    const pointEntitiesEnabled = editMode && !cursorInEntity && noTextSelected;

    return (
      <ToolbarGroup
        label="Text Block" highlightColor={CONTENT_COLORS.ContiguousText} columns={13.4}>
        <ToolbarLayout.Inline>
          <ToolbarButton
            onClick={
              () => onEdit(model.toggleStyle(InlineStyles.Bold, selection))
            }
            disabled={!supports('em') || noTextSelected || !editMode}
            tooltip="Bold">
            <i className={'fa fa-bold'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => onEdit(model.toggleStyle(InlineStyles.Italic, selection))
            }
            disabled={!supports('em') || noTextSelected || !editMode}
            tooltip="Italic">
            <i className={'fa fa-italic'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => onEdit(model.toggleStyle(InlineStyles.Strikethrough, selection))
            }
            disabled={!supports('em') || noTextSelected || !editMode}
            tooltip="Strikethrough">
            <i className={'fa fa-strikethrough'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => onEdit(model.toggleStyle(InlineStyles.Highlight, selection))
            }
            disabled={!supports('em') || noTextSelected || !editMode}
            tooltip="Highlight">
            <i className={'fas fa-pencil-alt'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => onEdit(model.toggleStyle(InlineStyles.Superscript, selection))
            }
            disabled={!supports('sup') || noTextSelected || !editMode}
            tooltip="Superscript">
            <i className={'fa fa-superscript'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => onEdit(model.toggleStyle(InlineStyles.Subscript, selection))
            }
            disabled={!supports('sub') || noTextSelected || !editMode}
            tooltip="Subscript">
            <i className={'fa fa-subscript'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => onEdit(model.toggleStyle(InlineStyles.Var, selection))
            }
            disabled={!supports('code') || noTextSelected || !editMode}
            tooltip="Code">
            {getContentIcon(insertableContentTypes.BlockCode)}
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {
              onEdit(model.toggleStyle(InlineStyles.Term, selection));
            }}
            disabled={!supports('term') || noTextSelected || !editMode}
            tooltip="Term">
            <i className={'fa fa-book'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {
              onEdit(model.toggleStyle(InlineStyles.Foreign, selection));
            }}
            disabled={!supports('foreign') || noTextSelected || !editMode}
            tooltip="Foreign">
            <i className={'fa fa-globe'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {
              onEdit(model.toggleStyle(InlineStyles.BidirectionTextOverride, selection));
            }}
            disabled={!supports('bdo') || bdoDisabled || !editMode}
            tooltip="Reverse Text Direction">
            <i className={'fa fa-angle-left'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => {
                onEdit(model.addEntity(
                  EntityTypes.quote, true, new contentTypes.Quote(), selection));
              }
            }
            disabled={!supports('quote') || !rangeEntitiesEnabled}
            tooltip="Quotation">
            <i className={'fa fa-quote-right'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => {
                onEdit(model.addEntity(
                  EntityTypes.link, true, new contentTypes.Link(), selection));
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

                onEdit(model.addEntity(
                  EntityTypes.extra, true, extra, selection));
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

                onEdit(model.addEntity(
                  EntityTypes.extra, true, extra, selection));
              }
            }
            disabled={!supports('extra') || !rangeEntitiesEnabled}
            tooltip="Rollover Content">
            <i className={'far fa-address-book'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => {
                onEdit(model.addEntity(
                  EntityTypes.activity_link, true, new contentTypes.ActivityLink(), selection));
              }
            }
            disabled={!supports('activity_link') || !rangeEntitiesEnabled}
            tooltip="High Stakes Assessment Link">
            <i className={'fa fa-check'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => {
                // This segment of code sets an initial target for the xref as a wb page
                // NOTE: this will fail if a link is created on the first page!
                const thisId = this.props.context.courseModel.resourcesById.get(
                this.props.context.documentId).id;

                const pages = this.props.context.courseModel.resources
                .toArray()
                .filter(r => r.type === LegacyTypes.workbook_page &&
                  r.id !== thisId &&
                  r.id !== PLACEHOLDER_ITEM_ID &&
                  r.resourceState !== ResourceState.DELETED);

                const xrefDefault  = (pages.length !== 0 ? pages[0].guid : '');

                onEdit(model.addEntity(
                  EntityTypes.xref, true,
                  new contentTypes.Xref({ page: xrefDefault, idref: xrefDefault }), selection));
              }
            }
            disabled={!supports('xref') || !rangeEntitiesEnabled}
            tooltip="Cross Reference Link">
            <i className={'fa fa-map-signs'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => {
                onEdit(model.addEntity(
                  EntityTypes.math, true, new contentTypes.Math(), selection));
              }
            }
            disabled={!supports('m:math') || !pointEntitiesEnabled}
            tooltip="MathML or Latex formula">
            {getContentIcon(insertableContentTypes.Math)}
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => {
                onEdit(model.addEntity(
                  EntityTypes.sym, true, new contentTypes.Sym(), selection));
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
                    onEdit(model.addEntity(EntityTypes.image, true, image, selection));
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
                      onEdit(model.addEntity(
                        EntityTypes.command, false, command, selectionSnapshot));
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
            disabled={!supports('cite') || !pointEntitiesEnabled}>

            {this.renderEntryOptions(selection)}
          </ToolbarNarrowMenu>
        </ToolbarLayout.Inline>
      </ToolbarGroup>
    );
  }

  renderMain(): JSX.Element {
    return null;
  }

}

const StyledContiguousTextToolbar = withStyles<ContiguousTextToolbarProps>(styles)
  (ContiguousTextToolbar);
export default StyledContiguousTextToolbar;
