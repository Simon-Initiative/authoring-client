import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { LinkTarget } from 'data/content/learning/common';
import { Select, Button } from 'editors/content/common/controls';
import { LegacyTypes } from 'data/types';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS, getContentIcon, insertableContentTypes } from
  'editors/content/utils/content';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ResourceState } from 'data/content/resource';
import { Clipboard } from 'types/clipboard';
import { ContentElement } from 'data/content/common/interfaces';
import { CourseModel } from 'data/models';
import { Label } from 'editors/content/common/Sidebar';
import { Either } from 'tsmonad';
import { MissingTargetId } from 'actions/xref';
import { HelpPopover } from 'editors/common/popover/HelpPopover.controller';

import './XrefEditor.scss';
import { PLACEHOLDER_ITEM_ID } from 'data/content/org/common';

export interface XrefEditorProps
  extends AbstractContentEditorProps<contentTypes.Xref> {
  onShowSidebar: () => void;
  displayModal: (component: any) => void;
  dismissModal: () => void;
  updateTarget: (targetId: string, documentResourceId: string) => Promise<any>;
  clipboard: Clipboard;
  course: CourseModel;
  target: Either<MissingTargetId, ContentElement>;
}

export interface XrefEditorState {

}

/* Cross Reference is essentially an internal link. It allows you to link to another
 workbook page (identified by the 'page' attribute, which is saved as a resource guid)
 and also, optionally, a specific element known as a 'target' within the page.
 The target is identified by the 'idref' attribute which points to a Content Element's id)
*/
export default class XrefEditor
  extends AbstractContentEditor
  <contentTypes.Xref, XrefEditorProps, XrefEditorState> {

  constructor(props) {
    super(props);

    this.onChangeTarget = this.onChangeTarget.bind(this);
    this.onChangePage = this.onChangePage.bind(this);
  }

  shouldComponentUpdate(nextProps: XrefEditorProps, nextState: XrefEditorState) {
    return super.shouldComponentUpdate(nextProps, nextState)
      || nextState !== this.state
      || nextProps.target !== this.props.target;
  }

  componentDidMount() {
    const { target, model, updateTarget } = this.props;

    // Xref must have a page set in order to allow linking to a target element. We set the default
    // page to be the first workbook page so that an error is not thrown in case the user chooses
    // a target element without changing the page using the 'page to link to' dropdown
    if (!this.props.model.page) {
      //KYLE-1997 With only one WBP in course, pages array is empty, and pages[0] is undefined
      this.props.onEdit(this.props.model.with(
        { page: this.pages[0] ? this.pages[0].guid :  'No pages to reference' }));
    }

    // Check if we need to fetch the target element from its workbook page
    if (!target && model.idref) {
      updateTarget(model.idref, model.page);
    }
  }

  thisId = this.props.context.courseModel.resources.get(
    this.props.context.documentId).id;

  pages = this.props.context.courseModel.resources
    .toArray()
    .filter(r => r.type === LegacyTypes.workbook_page &&
      r.id !== this.thisId &&
      r.id !== PLACEHOLDER_ITEM_ID &&
      r.resourceState !== ResourceState.DELETED);

  onChangeTarget() {
    const { onEdit, model, clipboard, updateTarget } = this.props;

    clipboard.item.lift((item) => {
      let id: string;
      // Handle contiguous text as a special case, retrieving the ID of the first paragraph
      if (item.contentType === 'ContiguousText') {
        id = (item as contentTypes.ContiguousText).getFirstReferenceId();
        // Else, if it's a valid xref target, it must have an ID
      } else if (isValidXrefTarget(item)) {
        id = (item as any).id;
      }

      if (id) {
        clipboard.page.lift((pageId) => {
          onEdit(model.with({ idref: id, page: pageId }));
          updateTarget(id, pageId);
        });
      }
    });
  }

  onChangePage(page: string) {
    const { onEdit, model, updateTarget } = this.props;

    onEdit(model.with({ page }));

    // Search for the target element in the new page
    if (model.idref) {
      updateTarget(model.idref, page);
    }
  }

  renderSidebar() {
    console.log("################################SIDEBAR");
    const { editMode, model, onEdit, target } = this.props;
    // KYLE-1997 The items displayed in the drop are HTML option elements in the array below
    const pageOptions = (this.pages ?
    this.pages.map(r => <option key={r.guid} value={r.id}>{r.title}</option>) :
    <option key={this.context.guid} value={this.context.id}>{'No pages to reference'}</option>);

    console.log(model.page);
    console.log(this.pages === false);
    console.table(this.pages);
    console.table(pageOptions);

    return (
      <SidebarContent title="Cross Reference">
        <SidebarGroup label="Page to link to">
          <Select
            editMode={this.props.editMode}
            label=""
            value={model.page}
            onChange={this.onChangePage}>
            {/*pageOptions*/}
          </Select>
        </SidebarGroup>
        <SidebarGroup label="Element to link to">
          <Target {...this.props} target={target} onChangeTarget={this.onChangeTarget} />
        </SidebarGroup>
        <SidebarGroup label="Target">
          <Select
            editMode={editMode}
            value={model.target}
            onChange={v =>
              onEdit(model.with({ target: v === 'self' ? LinkTarget.Self : LinkTarget.New }))}>
            <option value={LinkTarget.Self}>Open in this window</option>
            <option value={LinkTarget.New}>Open in new window</option>
          </Select>
        </SidebarGroup>
      </SidebarContent>
    );
  }

  renderToolbar() {
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup label="Cross-reference" columns={3} highlightColor={CONTENT_COLORS.Xref}>
        <ToolbarButton onClick={onShowSidebar} size={ToolbarButtonSize.Large}>
          <div><i className="fas fa-sliders-h" /></div>
          <div>Details</div>
        </ToolbarButton>
      </ToolbarGroup>
    );
  }

  renderMain() {
    return null;
  }
}

interface TargetProps extends XrefEditorProps {
  onChangeTarget: () => void;
}
const Target = ({ target, editMode, clipboard, onChangeTarget }: TargetProps) => {

  const validItemCopied = clipboard.item.caseOf({
    just: item => isValidXrefTarget(item),
    nothing: () => false,
  });

  return (
    <div className="target__container">
      <div className="target__instructions">
        <small>
          1. Open the target page in a new tab.
        </small>
        <br />
        <small>
          2. Select a valid target element and then copy it using the Copy
          button in the toolbar.
        <HelpPopover activateOnClick><ValidElementsHelp /></HelpPopover>
        </small>
        <br />
        <small>
          3. Use the button to link to the copied element.
        </small>
      </div>
      <Button editMode={editMode && validItemCopied} onClick={onChangeTarget}>
        Link Element
      </Button>
      <div className="target__description">

        {/* Target can be undefined (no target set),
        Either.right with the linked element, or
        Either.left indicating the linked element was not found (maybe deleted from the page) */}
        {target
          ? target.caseOf({
            right: element => (
              <Label>
                <span style={{ color: CONTENT_COLORS[element.contentType] }}>
                  {getContentIcon(insertableContentTypes[element.contentType])}
                </span> {validXrefTargets[element.elementType]}
              </Label>
            ),
            left: () => <span className="italic">
              {getContentIcon(insertableContentTypes[''])} Target not found in selected page
            </span>,
          })
          : <span className="italic">No target element</span>}
      </div>
    </div>
  );
};

const isValidXrefTarget = (item: ContentElement): boolean =>
  validXrefTargets[item.elementType];

const validXrefTargets = {
  alternatives: 'Alternatives',
  applet: 'Applet',
  audio: 'Audio',
  cite: 'Citation',
  codeblock: 'Code Block',
  composite: 'Composite',
  conjugate: 'Conjugate',
  conjugation: 'Conjugation',
  definition: 'Definition',
  director: 'Director',
  example: 'Example',
  extra: 'Extra',
  figure: 'Figure',
  flash: 'Flash',
  iframe: 'IFrame',
  image: 'Image',
  line: 'Line',
  materials: 'Materials',
  mathematica: 'Mathematica',
  meaning: 'Meaning',
  ol: 'Ordered List',
  panopto: 'Panopto',
  pronunciation: 'Pronunciation',
  pullout: 'Pullout',
  speaker: 'Speaker',
  table: 'Table',
  '#text': 'Text block',
  translation: 'Translation',
  ul: 'Unordered List',
  unity: 'Unity',
  video: 'Video',
  youtube: 'YouTube',
};

const ValidElementsHelp = () =>
  <React.Fragment>
    You can make cross-references to any of these element types:
    <br /><br />
    <ul>
      {Object.getOwnPropertyNames(validXrefTargets)
        .map(key => validXrefTargets[key])
        .map(target => <li>{target}</li>)}
    </ul>
  </React.Fragment>;
