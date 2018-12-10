import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { AssessmentModel } from '../assessment';
import { ContentElement } from 'data/content/common/interfaces';

export function splitQuestionsIntoPages(model: AssessmentModel) {
  const nodes = [];
  model.pages.forEach((page) => {
    page.nodes.forEach((node) => {
      nodes.push(node);
    });
  });

  // Merge supporting content into adjacent questions
  const indicesToRemove = [];
  nodes.forEach((node, nodeIndex) => {
    if (node.contentType === 'Content') {
      // try merging the supporting content into the next node
      const nextNode = nodes[nodeIndex + 1];
      const prevNode = nodes[nodeIndex - 1];
      if (nextNode && (nextNode.contentType === 'Question' ||
        nextNode.contentType === 'Content')) {
        nodes[nodeIndex + 1] = nextNode.with({
          body: node.body.with({
            content: node.body.content.concat(nextNode.body.content) as
              Immutable.OrderedMap<string, ContentElement>,
          }),
        });
        indicesToRemove.push(nodeIndex);
        // else merge it into the previous node
      } else if (prevNode && (prevNode.contentType === 'Question' ||
        prevNode.contentType === 'Content') && indicesToRemove.indexOf(nodeIndex - 1) === -1) {
        nodes[nodeIndex - 1] = prevNode.with({
          body: node.body.with({
            content: prevNode.body.content.concat(node.body.content) as
              Immutable.OrderedMap<string, ContentElement>,
          }),
        });
        indicesToRemove.push(nodeIndex);
      }
    }
  });
  const pages = nodes
    .reduce(
      (nodes: contentTypes.Node[], node: contentTypes.Node, i: number) =>
        indicesToRemove.indexOf(i) === -1 ? nodes.concat(node) : nodes,
      [])
    .map((node: contentTypes.Node, index: number) => new contentTypes.Page().with({
      id: 'p' + (index + 1).toString() + '_' + model.resource.id,
      nodes: Immutable.OrderedMap<string, contentTypes.Node>([[node.guid, node]]),
    }));

  return model.with({
    pages: Immutable.OrderedMap<string, contentTypes.Page>(
      pages.map(page => [page.guid, page])),
  });
}
