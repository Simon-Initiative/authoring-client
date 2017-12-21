import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';

import * as models from '../../../data/models';
import * as contentTypes from '../../../data/contentTypes';


/**
 * Finds a node based on guid in an assessment.
 */
export function findNodeByGuid(
  nodes: Immutable.OrderedMap<string, contentTypes.Node>, guid: string) : Maybe<contentTypes.Node> {

  // Check top level nodes first
  if (nodes.has(guid)) {
    return Maybe.just(nodes.get(guid));
  }

  // Check contents of all embedded pools next
  return nodes
    .toArray()
    .reduce(
      (node, p) => {
        if (p.contentType === 'Selection') {
          if (p.source.contentType === 'Pool') {
            const pool : contentTypes.Pool = p.source;
            return node.caseOf({
              just: n => node,
              nothing: () => {
                const n = pool.questions.get(guid);
                return n === undefined
                  ? Maybe.nothing<contentTypes.Node>()
                  : Maybe.just(n);
              },
            });
          }
        }
        return node;
      },
      Maybe.nothing<contentTypes.Node>());

}


/**
 *
 * Find closest relative.  In an assessment tree, find either the given node's
 * immediate next sibling - or, if the node has no siblings, return the node's parent.
 */
export function locateNextOfKin(
  nodes: Immutable.OrderedMap<string, contentTypes.Node>,
  guid: string) : Maybe<contentTypes.Node> {

  // Check top level nodes first
  if (nodes.has(guid)) {
    return chooseRelative(nodes, guid, Maybe.nothing<contentTypes.Node>());
  }

  // Check contents of all embedded pools next
  return nodes
    .toArray()
    .reduce(
      (node, p) => {
        if (p.contentType === 'Selection') {
          if (p.source.contentType === 'Pool') {
            const pool : contentTypes.Pool = p.source;
            return node.caseOf({
              just: n => node,
              nothing: () => {
                const n = pool.questions.get(guid);
                if (n !== undefined) {
                  return chooseRelative(
                    pool.questions, guid,
                    Maybe.just(p));
                }
              },
            });
          }
        }
        return node;
      },
      Maybe.nothing<contentTypes.Node>());

}

export function chooseRelative(
  nodes: Immutable.OrderedMap<string, contentTypes.Node>,
  guid: string, parent: Maybe<contentTypes.Node>) : Maybe<contentTypes.Node> {

  const arr = nodes
    .toArray();

  const index =
    arr
    .findIndex(q => q.guid === guid);

  if (nodes.size === 1) {
    return parent;
  }
  if (nodes.size === index + 1) {
    return Maybe.just(arr[index - 1]);
  }

  return Maybe.just(arr[index + 1]);
}

/**
 * Determines if the type of the assessment is restricted by the contents of
 * of the assessment (aka the model)
 * @param model the assessment model
 */
export function typeRestrictedByModel(model: models.AssessmentModel) : boolean {

  const questions = [];

  const pages = model.pages.toArray();

  // The type of the assessment is restricted (i.e. cannot be changed) if
  // it contains a selection or if it contains a question that has multiple parts

  return (
    pages.reduce(
      (prev, page) => {
        return prev || page.nodes.toArray().find(n => n.contentType === 'Selection') !== undefined;
      },
      false)

        ||

     pages.reduce(
      (prev, page) => {
        if (prev) return true;
        const questions = [];
        extractFromNodes(page.nodes, questions);
        return questions.find(q => isMultipart(q)) !== undefined;
      },
      false)
  );


}

function isMultipart(q: contentTypes.Question) {
  return q.items.size > 1;
}

function extractFromNodes(
  nodes: Immutable.OrderedMap<string, contentTypes.Node>,
  questions: contentTypes.Question[]) {

  nodes.toArray()
    .filter(n => n.contentType === 'Question')
    .forEach(q => questions.push(q as any));

  nodes.toArray()
    .filter(n => n.contentType === 'Selection')
    .forEach((selection) => {
      if (selection.contentType === 'Selection') {
        if (selection.source.contentType === 'Pool') {
          selection.source.questions.toArray()
            .forEach(q => questions.push(q));
        }
      }
    });

}

