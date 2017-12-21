import * as Immutable from 'immutable';
import * as models from '../../data/models';
import * as persistence from '../../data/persistence';
import * as contentTypes from '../../data/contentTypes';
import { Resource } from '../../data/content/resource';
import guid from '../../utils/guid';
import { LegacyTypes } from '../../data/types';
import { LockDetails } from '../../utils/lock';

const NEW_BUCKET_TITLE = 'Created In Editor';

// Routines mainly to support the unified data model of LOs and skills



function retrieveObjectives(courseId: string) : Promise<persistence.Document[]> {
  return persistence.bulkFetchDocuments(
      courseId, [LegacyTypes.learning_objectives], 'byTypes');
}

function retrieveSkills(courseId: string) : Promise<persistence.Document[]> {
  return persistence.bulkFetchDocuments(
      courseId, [LegacyTypes.skills_model], 'byTypes');
}

function createObjectivesModel() : models.LearningObjectivesModel {
  const id = guid();
  return new models.LearningObjectivesModel().with({
    id,
    guid: id,
    title: NEW_BUCKET_TITLE,
    resource: new Resource().with({ title: NEW_BUCKET_TITLE, id }),
  });
}

function createSkillsModel() : models.SkillsModel {
  const id = guid();
  return new models.SkillsModel().with({
    id,
    guid: id,
    title: NEW_BUCKET_TITLE,
    resource: new Resource().with({ title: NEW_BUCKET_TITLE, id }),
  });
}

type BucketCreationResult = {
  doc: persistence.Document;
  wasCreated: boolean;
};

function createNewBucket(
  courseId: string, docs: persistence.Document[], createFn, userName: string)
  : Promise<BucketCreationResult> {

  return new Promise((resolve, reject) => {
    const doc = docs
    .find(d => (d.model as any).title === NEW_BUCKET_TITLE);

    if (doc === undefined) {
      // Create and then lock it
      persistence.createDocument(courseId, createFn())
        .then((doc) => {
          resolve({ doc, wasCreated: true });
        })
        .catch(err => reject(err));
    } else {
      resolve({ doc, wasCreated: false });
    }
  });
}

export function retrieveAllObjectives(courseId: string)
  : Promise<Immutable.List<contentTypes.LearningObjective>> {

  return retrieveObjectives(courseId)
    .then(docs => docs.map(doc => (doc.model as models.LearningObjectivesModel)))
    .then((models : models.LearningObjectivesModel[]) => {
      return models.reduce(
        (all : Immutable.List<contentTypes.LearningObjective>, model) => {
          return all.merge(model.objectives.toArray());
        },
        Immutable.List<contentTypes.LearningObjective>(),
      );
    });
}

export function buildAggregateModel(courseId: string, userName: string) : Promise<AggregateModel> {
  return new Promise((resolve, reject) => {

    let objectives : persistence.Document[] = null;
    let skills : persistence.Document[] = null;
    let skillBucket : persistence.Document = null;
    let objectiveBucket : persistence.Document = null;


    // First fetch all the learning objectives and skills documents

    Promise
      .all([retrieveObjectives(courseId), retrieveSkills(courseId)])
      .then((results) => {

        objectives = results[0];
        skills = results[1];


        // Now see if the new bucket document for each type exists.  If it doesn't,
        // then go ahead and create it.  Then go ahead and try to lock the bucket documents.

        Promise.all([
          createNewBucket(courseId, objectives, createObjectivesModel, userName),
          createNewBucket(courseId, skills, createSkillsModel, userName)])

          .then((results: BucketCreationResult[]) => {

            // See if we had to create the bucket documents, if we did, then push those
            // onto the complete list of docs that make up the aggregate model

            if (results[0].wasCreated) {
              objectives.push(results[0].doc);
            }
            if (results[1].wasCreated) {
              skills.push(results[1].doc);
            }
            objectiveBucket = results[0].doc;
            skillBucket = results[1].doc;

            // Lock just the new bucket objective document first.  If that succeeds, we
            // can assume that we can safely lock all others.
            return persistence.acquireLock(courseId, results[0].doc._id);
          })
          .then((lockResult: LockDetails) => {

            if ((lockResult as any).lockedBy === userName) {
              return Promise.all([...objectives, ...skills]
                .map(d => persistence.acquireLock(courseId, d._id)));
            }

            resolve({
              objectives,
              skills,
              lockDetails: lockResult,
              isLocked: false,
              objectiveBucket,
              skillBucket,
            });
          })
          .then((lockResults: LockDetails[]) => {
            resolve({
              objectives,
              skills,
              lockDetails: lockResults[0],
              isLocked: true,
              objectiveBucket,
              skillBucket,
            });
          })
          .catch(err => reject(err));
      })
      .catch(err => reject(err));

  });
}

function objectivesToKV(doc: persistence.Document, itemFn) : any {
  return (doc.model as models.LearningObjectivesModel).objectives
    .toArray()
    .reduce(
      (o, obj) => {
        o[obj.id] = itemFn(doc, obj);
        return o;
      },
      {});
}


function skillsToKV(doc: persistence.Document, itemFn) : any {
  return (doc.model as models.SkillsModel).skills
    .toArray()
    .reduce(
      (o, obj) => {
        o[obj.id] = itemFn(doc, obj);
        return o;
      },
      {});
}

export function unifyObjectives(aggregate: AggregateModel) : UnifiedObjectivesModel {

  const mapping = aggregate.objectives
    .reduce(
      (map, doc) => map.merge(objectivesToKV(doc, (doc, obj) => doc)),
      Immutable.Map<string, persistence.Document>());


  const objectives = aggregate.objectives
    .reduce(
      (map, doc) => map.merge(objectivesToKV(doc, (doc, obj) => obj)),
      Immutable.Map<string, contentTypes.LearningObjective>());

  return {
    mapping,
    objectives,
    documents: aggregate.objectives,
    newBucket: aggregate.objectiveBucket,
  };
}

export function unifySkills(aggregate: AggregateModel) : UnifiedSkillsModel {

  const mapping = aggregate.skills
    .reduce(
      (map, doc) => map.merge(skillsToKV(doc, (doc, obj) => doc)),
      Immutable.Map<string, persistence.Document>());


  const skills = aggregate.skills
    .reduce(
      (map, doc) => map.merge(skillsToKV(doc, (doc, obj) => obj)),
      Immutable.Map<string, contentTypes.Skill>());

  return {
    mapping,
    skills,
    documents: aggregate.skills,
    newBucket: aggregate.skillBucket,
  };
}

export type AggregateModel = {
  objectives: persistence.Document[];
  objectiveBucket: persistence.Document;
  skills: persistence.Document[];
  skillBucket: persistence.Document;
  isLocked: boolean;
  lockDetails: LockDetails;
};


export type UnifiedObjectivesModel = {

  // All the docs that contain the objective models
  documents: persistence.Document[];

  newBucket: persistence.Document;

  // Mapping from LearningObjective id to the source document that contains it
  mapping: Immutable.Map<string, persistence.Document>;

  // Unified view of all learning objectives
  objectives: Immutable.OrderedMap<string, contentTypes.LearningObjective>;
};


export type UnifiedSkillsModel = {

  // All the docs that contain the objective models
  documents: persistence.Document[];

  newBucket: persistence.Document;

  // Mapping from LearningObjective id to the source document that contains it
  mapping: Immutable.Map<string, persistence.Document>;

  // Unified view of all learning objectives
  skills: Immutable.OrderedMap<string, contentTypes.Skill>;
};

