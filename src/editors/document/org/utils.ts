import * as Immutable from 'immutable';

import * as models from '../../../data/models';

import * as contentTypes from '../../../data/contentTypes';

import { canAcceptDrop } from '../../content/org/drag/utils';


export function canHandleDrop(
  id: string, sourceModel, parentModel, 
  originalIndex, newIndex, newParentModel) : boolean {

  let accepts = false;

  if (newParentModel.contentType === contentTypes.OrganizationContentTypes.Sequences) {
    accepts = sourceModel.contentTypes === contentTypes.OrganizationContentTypes.Sequence
      || sourceModel.contentTypes === contentTypes.OrganizationContentTypes.Include;

  } else if (newParentModel.contentType === contentTypes.OrganizationContentTypes.Sequence) {
    if (sourceModel.contentType === contentTypes.OrganizationContentTypes.Unit) {
      accepts = !newParentModel.children.toArray().some(
        child => child.contentType === contentTypes.OrganizationContentTypes.Module);
    } else if (sourceModel.contentType === contentTypes.OrganizationContentTypes.Module) {
      accepts = !newParentModel.children.toArray().some(
        child => child.contentType === contentTypes.OrganizationContentTypes.Unit);
    } else if  (sourceModel.contentType === contentTypes.OrganizationContentTypes.Include) {
      accepts = true;
    } 

  } else if (newParentModel.contentType === contentTypes.OrganizationContentTypes.Unit) {
    const t = sourceModel.contentType;
    accepts = t === contentTypes.OrganizationContentTypes.Module
      || t === contentTypes.OrganizationContentTypes.Include
      || t === contentTypes.OrganizationContentTypes.Item;

  } else if (newParentModel.contentType === contentTypes.OrganizationContentTypes.Module) {
    const t = sourceModel.contentType;
    accepts = t === contentTypes.OrganizationContentTypes.Section
      || t === contentTypes.OrganizationContentTypes.Include
      || t === contentTypes.OrganizationContentTypes.Item;

  } else if (newParentModel.contentType === contentTypes.OrganizationContentTypes.Section) {
    const t = sourceModel.contentType;
    accepts = (t === contentTypes.OrganizationContentTypes.Section
      || t === contentTypes.OrganizationContentTypes.Include
      || t === contentTypes.OrganizationContentTypes.Item)
      && sourceModel.guid !== newParentModel.guid;

  } 

  if (accepts) {

    // Now check to see if we are repositioning within the same container
    if (parentModel.guid === newParentModel.guid) {

      const delta = newIndex - originalIndex;

      // We do not accept the drop if it isn't repositioning. In other words,
      // one cannot drag and drop an item in the drop slots directly above and below
      // the item 
      return delta !== 0 && delta !== 1;

    } else {
      return true;
    }

  } else {
    return false;
  }
}

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


export function updateNode(
  model: models.OrganizationModel,
  childToUpdate: any) : models.OrganizationModel {

  return model.with({ sequences: model.sequences.with(
    { children: (model.sequences.children.map(
      updateChild.bind(undefined, childToUpdate)).toOrderedMap() as any), 
    }) });
}


function updateChild(
  child: any, 
  parentNode: any) {
  
  if (parentNode.children !== undefined && parentNode.children.get(child.guid) !== undefined) {
    return parentNode.with({ children: parentNode.children.set(child.guid, child) });

  } else {

    // Recurse if the current node has children
    return parentNode.children !== undefined && parentNode.children.size > 0
      ? parentNode.with(
        { children: parentNode.children.map(
          updateChild.bind(undefined, child)).toOrderedMap() }) 
      : parentNode;
  }
}


function filterChildren(
  guidToRemove: string, 
  children: Immutable.OrderedMap<string, any>) : Immutable.OrderedMap<string, any> {

  const filtered = children.filter(c => c.guid !== guidToRemove);
  const mapped = filtered
    .map(c => c.children !== undefined 
      ? c.with({ children: filterChildren(guidToRemove, c.children) }) : c);

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
      ? parentNode.with(
        { children: parentNode.children.map(
          insertChild.bind(undefined, targetParentGuid, childToAdd, index)).toOrderedMap() }) 
      : parentNode;
  }
}



