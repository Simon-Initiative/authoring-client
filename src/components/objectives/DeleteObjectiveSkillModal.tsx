import { Resource } from 'data/content/resource';
import * as React from 'react';
import { Edge } from 'types/edge';
import { SortDirection, SortableTable } from 'components/common/SortableTable';
import { CourseModel } from 'data/models';
import { LegacyTypes } from 'data/types';
import * as contentTypes from 'data/contentTypes';
import { AppServices } from 'editors/common/AppServices';
import { ModalMessage } from 'utils/ModalMessage';

export interface DeleteObjectiveSkillModalProps {
  model: contentTypes.Skill | contentTypes.LearningObjective;
  course: CourseModel;
  services: AppServices;
  edges: Edge[];
}

interface DeleteObjectiveSkillModalState {

}

export default class DeleteObjectiveSkillModal extends
  React.Component<DeleteObjectiveSkillModalProps, DeleteObjectiveSkillModalState> {

  constructor(props) {
    super(props);
  }

  // Edge sourceId looks like 'javascript-evz4jsnu:1.0:welcome',
  // in the form '{courseId}:{version}:{resourceId}'.
  edgeResourceId(edge: Edge): string {
    return edge.sourceId.slice(edge.sourceId.lastIndexOf(':') + 1);
  }

  edgeResource(resourceId: string): Resource {
    console.log('edgeResource', this.props.course.resourcesById.get(resourceId));
    return this.props.course.resourcesById.get(resourceId);
  }

  edgeResourceTitle(id: string): string {
    return this.edgeResource(id).title;
  }

  edgeType(type: LegacyTypes): string {
    switch (type) {
      case 'x-oli-skill':
        return 'Skill';
      case 'x-oli-objective':
        return 'Learning Objective';
      case 'x-oli-workbook_page':
        return 'Workbook Page';
      case 'x-oli-inline-assessment':
      case 'x-oli-assessment2':
        return 'Assessment';
      case 'x-oli-assessment2-pool':
        return 'Assessment Pool';
      case 'x-oli-organization':
        return 'Organization';
      default:
        return type;
    }
  }

  render() {
    const { course, model, edges } = this.props;

    const modelType = model.contentType === 'Skill' ? 'skill' : 'learning objective';

    const rows = edges.map(e => ({ key: e.guid, data: e }));

    const labels = [
      'Name',
      'Type',
    ];

    const safeCompare =
      (key: string, direction: SortDirection, a: Edge, b: Edge): number => {
        const aValue = key === 'title' ? this.edgeResourceTitle(this.edgeResourceId(a)) : a[key];
        const bValue = key === 'title' ? this.edgeResourceTitle(this.edgeResourceId(b)) : b[key];

        if (aValue === null && bValue === null) {
          return 0;
        }
        if (aValue === null) {
          return direction === SortDirection.Ascending ? 1 : -1;
        }
        if (bValue === null) {
          return direction === SortDirection.Ascending ? -1 : 1;
        }
        if (aValue === bValue) {
          return 0;
        }
        return direction === SortDirection.Ascending
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      };

    const comparators = [
      (direction, a, b) => safeCompare('title', direction, a, b),
      (direction, a, b) => safeCompare('sourceType', direction, a, b),
    ];

    // Dismiss the modal and link to the resource that references this skill/LO
    const link = (edge: Edge) => (text: string) =>
      <a onClick={() => this.props.services.dismissModal()}
         href={`/#${this.edgeResource(this.edgeResourceId(edge)).guid}-${course.guid}`}
         className="btn btn-link">
        {text}
      </a>;

    const columnRenderers = [
      (edge: Edge) => link(edge)(this.edgeResourceTitle(this.edgeResourceId(edge))),
      (edge: Edge) => <span>{this.edgeType(edge.sourceType)}</span>,
    ];

    const edgeTable =
      <React.Fragment>
        {/* tslint:disable-next-line:max-line-length */}
        <p>This {modelType} is used in the following {edges.length === 1 ? 'place' : edges.length + ' places'}. All references must be removed before the {modelType} can be deleted.</p>
        <SortableTable
          model={rows}
          columnComparators={comparators}
          columnRenderers={columnRenderers}
          columnLabels={labels}
        />
      </React.Fragment>;

    return (
      <ModalMessage
        onCancel={() => this.props.services.dismissModal()}
        okLabel="Okay">
        {edgeTable}
      </ModalMessage>
    );
  }
}
