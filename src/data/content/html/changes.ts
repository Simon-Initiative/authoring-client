import { ContentState, ContentBlock, EntityMap, Entity } from 'draft-js';
import * as Immutable from 'immutable';
import { EntityTypes } from './common';

export type Changes = {
  additions: Immutable.List<Entity>;
  deletions: Immutable.List<Entity>;
}

export type EntityInfo = {
  entityKey: string,
  entity: Entity
}

function getEntitiesForBlock(type: EntityTypes, contentBlock: ContentBlock, contentState: ContentState) : EntityInfo[] {
  
  const entities = [];
  
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      const matches = entityKey !== null &&
        contentState.getEntity(entityKey).getType() === type;

      if (matches) {
        entities.push({ entityKey, entity: contentState.getEntity(entityKey)});
      }
      return false;
    },
    () => {}
  );

  return entities;
}

export function getEntities(type: EntityTypes, 
  contentState: ContentState) : EntityInfo[] {

  return contentState.getBlocksAsArray()
    .map(block => getEntitiesForBlock(type, block, contentState))
    .reduce((p, c) => p.concat(c), []);
}

function keyedByInput(entities : EntityInfo[], uniqueIdentifier: string) : Object {
  return entities
    .reduce((p, c) => {
      p[c.entity.data[uniqueIdentifier]] = c;
      return p;
    }, {});
}

// For a given entity type, determine any that have been
// added or deleted between versions of ContentState 
export function changes(
  type: EntityTypes, uniqueIdentifier: string,
  prev: ContentState, current: ContentState) : Changes {

    let additions = Immutable.List<EntityInfo>();
    let deletions = Immutable.List<EntityInfo>();

    const prevEntities = keyedByInput(getEntities(type, prev), uniqueIdentifier);
    const currentEntities = keyedByInput(getEntities(type, current), uniqueIdentifier);    

    for (let key in prevEntities) {
      if (currentEntities[key] === undefined) {
        deletions = deletions.push(prevEntities[key]);
      }
    }
    for (let key in currentEntities) {
      if (prevEntities[key] === undefined) {
        additions = additions.push(currentEntities[key]);
      }
    }

    return {
      additions,
      deletions
    }
}

