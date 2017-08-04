import * as React from 'react';
import * as Immutable from 'immutable';
import * as t from '../../../data/contentTypes';

export type IsNodeExpanded = (guid: string) => boolean;

export type NodeTypes = t.Sequence | t.Unit | t.Module | t.Section | t.Item | t.Include;

export function render(
  sequences: t.Sequences, isExpanded: IsNodeExpanded,
  nodeRenderers: any, elementWrapper: any) : React.Component[] {

  const elements = [];

  const arr = sequences.children.toArray();

  let i = -1;

  sequences.children.forEach((n) => {
    
    i = i + 1;

    return renderHelper(
      n, sequences, i, isExpanded, 
      elements, nodeRenderers, elementWrapper, 0);

  });
  
  return elements;
}

export function renderHelper(
  node : NodeTypes, parent: any, index: number, 
  isExpanded: IsNodeExpanded, elements: React.Component[],
  nodeRenderers: any, elementWrapper: any, depth: number) {

  elements.push(elementWrapper(node, nodeRenderers(node, parent, index, depth), index));

  if (isExpanded(node.guid) 
    && node.contentType !== t.OrganizationContentTypes.Item 
    && node.contentType !== t.OrganizationContentTypes.Include) {

    const arr = (node.children as any).toArray();

    let i = -1;

    (node.children as any).forEach((n) => {
      
      i = i + 1;

      return renderHelper(
        n, node, i, isExpanded, elements, 
        nodeRenderers, elementWrapper, depth + 1);
    });
  }
}

