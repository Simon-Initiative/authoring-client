import { ContentBlock, ContentState, Entity, Modifier, SelectionState } from 'draft-js';
import * as Immutable from 'immutable';
import { EntityTypes } from '../common';

export type Changes = {
  additions: Immutable.List<Entity>;
  deletions: Immutable.List<Entity>;
};

export type EntityRange = {
  start: number,
  end: number,
  contentBlock: ContentBlock,
};

export type EntityInfo = {
  range: EntityRange,
  entityKey: string,
  entity: Entity,
};

export function removeInputRef(contentState: ContentState, itemModelId: string) : ContentState {

    // Find the range that represents the entity
  const range = findEntityRangeByInput(itemModelId, contentState);

    // Remove that entity via its range
  if (range !== null) {
    const selectionState = new SelectionState({
      anchorKey: range.contentBlock.key,
      focusKey: range.contentBlock.key,
      anchorOffset: range.start,
      focusOffset: range.end,
    });
    return Modifier.applyEntity(contentState, selectionState, null);

  }

  return contentState;
}

function findEntityRangeByInput(inputId: string, contentState: ContentState) : EntityRange {

  const matchPredicate = (key: string) => {
    return key !== null &&
      contentState.getEntity(key).getData()['@input'] === inputId;
  };

  const result = contentState.getBlocksAsArray()
    .map(block => findEntityRangeForBlock(block, contentState, matchPredicate))
    .reduce((p, c) => p.concat(c), []);

  if (result.length > 0) {
    return result[0];
  }

  return null;
}

function findEntityRangeForBlock(
  contentBlock: ContentBlock,
  contentState: ContentState, isMatch: (key: string) => boolean) : EntityRange[] {

  const ranges = [];

  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return isMatch(entityKey);
    },
    (start: number, end: number) => {
      ranges.push({ start, end, contentBlock });
    },
  );

  return ranges;
}

function getEntitiesForBlock(
  contentBlock: ContentBlock,
  contentState: ContentState, isMatch: (key: string) => boolean) : EntityInfo[] {

  const entities = [];
  let lastEntityKey = null;

  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      const matches = entityKey !== null && isMatch(entityKey);
      if (matches) {
        lastEntityKey = entityKey;
        return true;

      }
      return false;
    },
    (start: number, end: number) => {
      entities.push({
        range: {
          start,
          end,
          contentBlock,
        },
        entityKey: lastEntityKey,
        entity: contentState.getEntity(lastEntityKey),
      });
    },
  );

  return entities;
}

export function getEntities(
  type: EntityTypes,
  contentState: ContentState) : EntityInfo[] {

  const matchPredicate = (key: string) => {
    return key !== null &&
        contentState.getEntity(key).getType() === type;
  };

  return contentState.getBlocksAsArray()
    .map(block => getEntitiesForBlock(block, contentState, matchPredicate))
    .reduce((p, c) => p.concat(c), []);
}

export function getAllEntities(
  contentState: ContentState) : EntityInfo[] {

  const matchPredicate = (key: string) => true;

  return contentState.getBlocksAsArray()
    .map(block => getEntitiesForBlock(block, contentState, matchPredicate))
    .reduce((p, c) => p.concat(c), []);
}

function keyedByInput(entities : EntityInfo[], uniqueIdentifier: string) : Object {
  return entities
    .reduce(
      (p, c) => {
        p[c.entity.data[uniqueIdentifier]] = c;
        return p;
      },
      {});
}

// For a given entity type, determine any that have been
// added or deleted between versions of ContentState
export function detectChanges(
  type: EntityTypes, uniqueIdentifier: string,
  prev: ContentState, current: ContentState) : Changes {

  let additions = Immutable.List<EntityInfo>();
  let deletions = Immutable.List<EntityInfo>();

  const prevEntities = keyedByInput(getEntities(type, prev), uniqueIdentifier);
  const currentEntities = keyedByInput(getEntities(type, current), uniqueIdentifier);

  for (const key in prevEntities) {
    if (currentEntities[key] === undefined) {
      deletions = deletions.push(prevEntities[key]);
    }
  }
  for (const key in currentEntities) {
    if (prevEntities[key] === undefined) {
      additions = additions.push(currentEntities[key]);
    }
  }

  return {
    additions,
    deletions,
  };
}


