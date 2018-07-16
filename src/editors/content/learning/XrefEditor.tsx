import * as React from 'react';
import { JSSProps } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';

import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { LinkTarget } from 'data/content/learning/common';
import { Select, Button } from '../common/controls';
import { LegacyTypes } from 'data/types';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ResourceState } from 'data/content/resource';
import { Clipboard } from 'types/clipboard';
import { ContentElement } from 'data/content/common/interfaces';
import { CourseModel } from 'data/models';
import { Label } from 'editors/content/common/Sidebar';
import { ModalMessage } from 'utils/ModalMessage';

export interface XrefEditorProps
  extends AbstractContentEditorProps<contentTypes.Xref> {
  onShowSidebar: () => void;
  clipboard: Clipboard;
  displayModal: (component: any) => void;
  dismissModal: () => void;
  course: CourseModel;
}

export interface XrefEditorState {
  noItemCopied: boolean,
}

/**
 * React Component
 */
export default class XrefEditor
  extends AbstractContentEditor
  <contentTypes.Xref, XrefEditorProps & JSSProps, XrefEditorState> {

  constructor(props) {
    super(props);

    this.state = {
      noItemCopied: false,
    };

    this.onSetTargetElement = this.onSetTargetElement.bind(this);
  }

  validXrefTargets = {
    alternatives: true,
    applet: true,
    audio: true,
    cite: true,
    codeblock: true,
    composite: true,
    conjugate: true,
    conjugation: true,
    definition: true,
    dialog: true,
    director: true,
    example: true,
    extra: true,
    figure: true,
    flash: true,
    iframe: true,
    image: true,
    line: true,
    materials: true,
    mathematica: true,
    meaning: true,
    ol: true,
    panopto: true,
    pronunciation: true,
    pullout: true,
    speaker: true,
    table: true,
    translation: true,
    ul: true,
    unity: true,
    video: true,
    youtube: true,
  };

  onSetTargetElement() {
    const { onEdit, model, displayModal, dismissModal, clipboard } = this.props;

    const infoModal = (copiedElement: ContentElement) => <ModalMessage onCancel={dismissModal}>
      <React.Fragment>
        Cross-references don't support {copiedElement.contentType} elements.
        You can make cross-references to any of these element types:
        <br /><br />
        <ul>
          <li>Alternatives</li>
          <li>Applet</li>
          <li>Audio</li>
          <li>Citation</li>
          <li>Code block</li>
          <li>Composite</li>
          <li>Conjugate</li>
          <li>Conjugation</li>
          <li>Definition</li>
          <li>Dialog</li>
          <li>Director</li>
          <li>Example</li>
          <li>Extra</li>
          <li>Figure</li>
          <li>Flash</li>
          <li>IFrame</li>
          <li>Image</li>
          <li>Line</li>
          <li>Materials</li>
          <li>Mathematica</li>
          <li>Meaning</li>
          <li>Ordered List</li>
          <li>Panopto</li>
          <li>Pronunciation</li>
          <li>Pullout</li>
          <li>Speaker</li>
          <li>Table</li>
          <li>Translation</li>
          <li>Unordered List</li>
          <li>Unity</li>
          <li>Video</li>
          <li>Youtube</li>
        </ul>
      </React.Fragment>
    </ModalMessage>;

    const isValidXrefTarget = (item: ContentElement): boolean =>
      this.validXrefTargets[item.elementType];

    clipboard.item.caseOf({
      just: (item) => {
        if (console.log({ item }) || isValidXrefTarget(item)) {
          onEdit(model.with({ idref: item.id }));
          this.setState({ noItemCopied: false });
        } else {
          displayModal(infoModal(item));
        }
      },
      nothing: () => this.setState({ noItemCopied: true }),
    });
  }

  renderNoItemCopiedWarning() {
    return (
      <div style={{ backgroundColor: 'tomato' }}>
        Clipboard is empty
      </div>
    );
  }

  renderTarget() {
    const { course, model } = this.props;
    console.log('idref', model.idref);
    console.log('resource?', course.resourcesById.get(model.idref));
    return (
      <React.Fragment>
        <Label>Linked Element</Label>
        {course.resourcesById.get(model.idref)}
      </React.Fragment>
    );
  }

  renderSidebar() {
    const { editMode, model, onEdit, context } = this.props;

    const pages = context.courseModel.resources
      .toArray()
      .filter(r => r.type === LegacyTypes.workbook_page &&
        r.resourceState !== ResourceState.DELETED)
      .map(r => <option key={r.id} value={r.id}>{r.title}</option>);

    return (
      <SidebarContent title="Cross Reference">
        <SidebarGroup label="Page to link to">
          <Select
            editMode={this.props.editMode}
            label=""
            value={model.page}
            onChange={page => onEdit(model.with({ page }))}>
            {pages}
          </Select>
        </SidebarGroup>
        <SidebarGroup label="Element to link to">
          <small>1. Open the target page in a new tab</small><br />
          <small>2. Select the target element and then copy it using the Copy
            button in the toolbar</small><br />
          <small>3. Link to the copied element with the button below.</small><br />
          <Button editMode={editMode} onClick={this.onSetTargetElement}>Link Element</Button>
          {model.idref
            ? this.renderTarget()
            : null}
          {this.state.noItemCopied
            ? this.renderNoItemCopiedWarning()
            : null}
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
          <div><i className="fa fa-sliders" /></div>
          <div>Details</div>
        </ToolbarButton>
      </ToolbarGroup>
    );
  }

  renderMain() {
    return null;
  }
}
