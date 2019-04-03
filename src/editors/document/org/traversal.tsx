import * as React from 'react';
import * as t from '../../../data/contentTypes';
import * as org from 'data/models/utils/org';

export type IsNodeExpanded = (guid: string) => boolean;

export type NodeTypes = t.Sequence | t.Unit | t.Module | t.Section | t.Item | t.Include;


export function getExpandId(model: NodeTypes): string {
  if (model.contentType === t.OrganizationContentTypes.Include) {
    return model.guid;
  }

  return model.id;
}

export function render(
  sequences: t.Sequences, isExpanded: IsNodeExpanded,
  nodeRenderers: any, placements: org.Placements): React.Component[] {

  const elements = [];

  let i = -1;

  sequences.children.forEach((n) => {

    i = i + 1;

    return renderHelper(
      n, sequences, i, isExpanded,
      elements, nodeRenderers, 0, placements);

  });

  return elements;
}

export function renderHelper(
  node: NodeTypes, parent: any, index: number,
  isExpanded: IsNodeExpanded, elements: React.Component[],
  nodeRenderers: any, depth: number, placements: org.Placements) {

  elements.push(nodeRenderers(
    node, parent, index, depth, placements.get(node.id).positionAtLevel.valueOr(0)));

  if (isExpanded(getExpandId(node))
    && node.contentType !== t.OrganizationContentTypes.Item
    && node.contentType !== t.OrganizationContentTypes.Include) {

    let i = -1;

    (node.children as any).forEach((n) => {

      i = i + 1;

      return renderHelper(
        n, node, i, isExpanded, elements,
        nodeRenderers, depth + 1, placements);
    });
  }
}

