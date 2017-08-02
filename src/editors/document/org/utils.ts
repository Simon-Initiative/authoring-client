import * as Immutable from 'immutable';

import * as models from '../../../data/models';
import * as contentTypes from '../../../data/contentTypes';

export function removeNode(
  model : models.OrganizationModel, 
  nodeGuid: string) : models.OrganizationModel {

  const sequences = model.sequences.children;
  const filtered = filterChildren(nodeGuid, sequences) as any;


  const updated = model.with(
    { sequences: model.sequences.with(
      { children: filtered }),
    });

  return updated;
}

export function insertNode(
  model: models.OrganizationModel,
  targetParentGuid: string,
  childToAdd: any,
  index: number) : models.OrganizationModel {

  return model.with({ sequences: model.sequences.with(
    { children: (model.sequences.children.map(
      insertChild.bind(undefined, targetParentGuid, childToAdd, index)).toOrderedMap() as any), 
    }) });
}


function filterChildren(
  guidToRemove: string, 
  children: Immutable.OrderedMap<string, any>) : Immutable.OrderedMap<string, any> {

  const filtered = children.filter(c => c.guid !== guidToRemove);
  const mapped = filtered.map(c => c.children !== undefined ? c.with({ children: filterChildren(guidToRemove, c.children) }) : c);

  return mapped
    .toOrderedMap();

}


function insertChild(
  targetParentGuid: string,
  childToAdd: any, 
  index: number,
  parentNode: any) {
  
  if (parentNode.guid === targetParentGuid) {

    // Insert the node, don't recurse
    let nodes = Immutable.OrderedMap<string, any>();
    const arr = parentNode.children.toArray();
    arr.forEach((n, i) => {

      if (i === index) {
        nodes = nodes.set(childToAdd.guid, childToAdd);
      }

      if (n.guid !== childToAdd.guid) {
        nodes = nodes.set(n.guid, n);
      } 
    });

    if (index === arr.length) {
      nodes = nodes.set(childToAdd.guid, childToAdd);
    }

    return parentNode.with({ children: nodes });

  } else {

    // Recurse if the current node has children
    return parentNode.children !== undefined && parentNode.children.size > 0
      ? parentNode.with({ children: parentNode.children.map(insertChild.bind(undefined, targetParentGuid, childToAdd, index)).toOrderedMap() }) 
      : parentNode;
  }
}



