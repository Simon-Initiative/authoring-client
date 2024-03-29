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
import { SidebarGroup, SidebarRow } from 'components/sidebar/ContextAwareSidebar';
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
  targetIsPage: boolean;
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
    this.onToggleTargetPage = this.onToggleTargetPage.bind(this);
    this.state = {
      targetIsPage: props.model.idref === props.model.page,
    };
  }

  shouldComponentUpdate(nextProps: XrefEditorProps, nextState: XrefEditorState) {
    return super.shouldComponentUpdate(nextProps, nextState)
      || nextState !== this.state
      || this.hasTargetChanged(nextProps);
  }

  componentDidMount() {
    const { model, updateTarget } = this.props;
    updateTarget(model.idref, model.page);

  }

  hasTargetChanged(nextProps: XrefEditorProps) {

    const { target } = this.props;
    if (nextProps.target === undefined) {
      return target !== undefined;
    }
    if (target === undefined) {
      return nextProps.target !== undefined;
    }

    const changed = target.caseOf({
      left: (s) => {
        return nextProps.target.caseOf({
          left: s1 => s !== s1,
          right: e1 => true,
        });
      },
      right: (e) => {
        return nextProps.target.caseOf({
          left: s1 => true,
          right: e1 => e !== e1,
        });
      },
    });
    return changed;
  }


  componentWillReceiveProps(nextProps: XrefEditorProps) {
    const { updateTarget, model } = this.props;
    if (model.idref !== nextProps.model.idref) {
      this.setState({ targetIsPage: nextProps.model.idref === nextProps.model.page },
         () => { updateTarget(nextProps.model.idref, nextProps.model.page); });
    }
  }

  thisId = this.props.context.courseModel.resourcesById.get(
    this.props.context.documentId).id;

  pages = this.props.context.courseModel.resources
    .toArray()
    .filter(r => r.type === LegacyTypes.workbook_page &&
      r.id !== this.thisId &&
      r.id !== PLACEHOLDER_ITEM_ID &&
      r.resourceState !== ResourceState.DELETED);

  noPages = this.pages.length === 0;

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
          setTimeout(() => updateTarget(id, pageId), 0);
        });
      }
    });

  }

  onChangePage(page: string) {

    const { onEdit, model, updateTarget } = this.props;
    onEdit(model.with({ page, idref: page }));
    if (!this.state.targetIsPage) {
      // To avoid invalid xref state (unbuildable if written out),
      // a page change from element target resets to whole page target.
      this.setState({ targetIsPage: true });
      setTimeout(() => updateTarget(model.page, model.page), 0);
    }

  }

  onToggleTargetPage(targetIsPage: boolean) {

    const { onEdit, model, updateTarget } = this.props;
    this.setState({ targetIsPage });
    if (targetIsPage) {
      onEdit(model.with({ idref: model.page }));
      setTimeout(() => updateTarget(model.page, model.page), 0);
    }
  }

  renderSidebar() {
    const { editMode, model, onEdit, target } = this.props;
    const pageOptions = (this.pages.length === 0 ?
      <option key={this.context.guid} value={this.context.id}>{'No pages to reference'}</option> :
      this.pages.map(r => <option key={r.guid} value={r.id}>{r.title}</option>));

    return (
      <SidebarContent title="Cross Reference">
        <SidebarGroup label="Page to link to">
          <Select
            editMode={this.props.editMode && !this.noPages}
            label=""
            value={model.page}
            onChange={this.onChangePage}>
            {pageOptions}
          </Select>
        </SidebarGroup>
        <SidebarGroup label="Link Target">
          <SidebarRow>
            <div className="form-check">
              <label className="form-check-label">
                <input className="form-check-input"
                  name="targetOption"
                  value="page"
                  checked={this.state.targetIsPage}
                  onChange={() => this.onToggleTargetPage(true)}
                  disabled={this.noPages}
                  type="radio" />&nbsp; Selected Page
              </label>
            </div>
            <div className="form-check">
              <label className="form-check-label">
                <input className="form-check-input"
                  name="targetOption"
                  onChange={() => this.onToggleTargetPage(false)}
                  value="element"
                  checked={!this.state.targetIsPage}
                  disabled={this.noPages}
                  type="radio" />&nbsp; Specific Element
              </label>
            </div>
          </SidebarRow>
          <Target {...this.props} targetIsPage={this.state.targetIsPage} target={target}
            onChangeTarget={this.onChangeTarget} />
        </SidebarGroup>
        {false &&  // hide b/c delivery ignores this setting (always opens in new popup)
          <SidebarGroup label="On Click">
            <Select
              editMode={editMode}
              value={model.target}
              onChange={v =>
                onEdit(model.with({ target: v === 'self' ? LinkTarget.Self : LinkTarget.New }))}>
              <option value={LinkTarget.Self}>Open in this window</option>
              <option value={LinkTarget.New}>Open in new window</option>
            </Select>
          </SidebarGroup>
        }
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
  targetIsPage: boolean;
}
const Target = ({ target, editMode, clipboard, onChangeTarget, targetIsPage }: TargetProps) => {
  const validItemCopied = clipboard.item.caseOf({
    just: item => isValidXrefTarget(item),
    nothing: () => false,
  });

  const renderedTarget = target
    ? target.caseOf({
      right: element => (
        <Label>
          <span style={{ color: CONTENT_COLORS[element.contentType] }}>
            {getContentIcon(insertableContentTypes[element.contentType])}
          </span> {validXrefTargets[element.elementType]}
        </Label>
      ),
      left: () => (
        targetIsPage ? (
          <span>
            <i className={'far fa-file'} /> Workbook Page
          </span>
        ) : (
            <span className="italic">
              {getContentIcon(insertableContentTypes[''])} Target not found in selected page
            </span>)
      ),
    })
    : <span className="italic">No target element</span>;

  return (
    <div className="target__container">
      <div className="target__instructions">
        <small>
          1. Open the target page.
        </small>
        <br />
        <small>
          2. Select a valid target element and then copy it using the Copy
          button in the toolbar.
          <HelpPopover activateOnClick><ValidElementsHelp /></HelpPopover>
        </small>
        <br />
        <small>
          3. Click this button to link to the copied element:
        </small>
      </div>
      <Button editMode={editMode && validItemCopied} onClick={onChangeTarget}>
        Link Element
      </Button>
      <div className="target__description">

        {/* Target can be undefined (no target set),
          Either.right with the linked element, or
          Either.left indicating the linked element was not found or is a page */}
        {renderedTarget}
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
