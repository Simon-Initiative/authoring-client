import * as models from 'data/models';
import * as Immutable from 'immutable';
import { Sequence, Sequences, Unit, Module, Resource,
  Section, Include, Item } from 'data/contentTypes';
import * as persistence from 'data//persistence';
import { viewOrganizations } from 'actions/view';
import { courseChanged, updateTitles } from 'actions/course';
import guid from 'utils/guid';
import { LegacyTypes } from 'data/types';

const createOrgDuplicate = (courseId: string, sourceModel: models.OrganizationModel)
  : models.OrganizationModel => {

  const g = guid();
  const title = 'Copy of ' + sourceModel.title;

  const id = courseId + '_' +
    title.toLowerCase().split(' ')[0] + '_'
    + g.substring(g.lastIndexOf('-') + 1);

  const { version, product, audience, labels } = sourceModel;

  const sequences = dupe(sourceModel.sequences) as Sequences;

  return new models.OrganizationModel().with({
    resource: new Resource().with({ id, guid: id, title }),
    type: LegacyTypes.organization,
    id,
    version,
    product,
    audience,
    labels,
    sequences,
    title,
  });
};

type OrgNode = Sequences | Sequence | Unit | Module | Section | Include | Item;

// Recursive (through dupeChildren) duplication of immutable org tree,
// careful to change all the guids and ids
function dupe(v: OrgNode) : OrgNode {

  const id = guid();

  if (v.contentType === 'Item') {
    return v.with({ guid: id, id });
  } else if (v.contentType === 'Sequences') {
    return v.with({ guid: id, children: dupeChildren(v.children) });
  } else if (v.contentType === 'Sequence') {
    return v.with({ guid: id, id, children: dupeChildren(v.children) });
  } else if (v.contentType === 'Unit') {
    return v.with({ guid: id, id, children: dupeChildren(v.children) });
  } else if (v.contentType === 'Module') {
    return v.with({ guid: id, id, children: dupeChildren(v.children) });
  } else if (v.contentType === 'Section') {
    return v.with({ guid: id, id, children: dupeChildren(v.children) });
  } else if (v.contentType === 'Include') {
    return v.with({ guid: id });
  }

}

function dupeChildren(children: Immutable.OrderedMap<string, OrgNode>)
  : Immutable.OrderedMap<string, any> {

  return Immutable.OrderedMap<string, any>(
    children
      .toArray()
      .map(c => dupe(c))
      .reduce((arr, c) => [...arr, [c.guid, c]], []),
  );

}

export function duplicateOrganization(
  courseId: string,
  sourceModel: models.OrganizationModel,
  courseModel: models.CourseModel) {

  return function (dispatch) {

    persistence.createDocument(courseId, createOrgDuplicate(courseId, sourceModel))
      .then((doc) => {

        if (doc.model.modelType === 'OrganizationModel') {

          const updatedModel = courseModel.with({
            resources: courseModel.resources.set(doc.model.resource.id, doc.model.resource),
          });

          dispatch(courseChanged(updatedModel));
          dispatch(updateTitles([{ id: doc._id, title: doc.model.resource.title }]));

          viewOrganizations(courseId);
        }


      });

  };
}
