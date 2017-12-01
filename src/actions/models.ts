import * as models from 'data/models';
import * as Immutable from 'immutable';
import { Sequence, Sequences, Unit, Module, Resource,
  Section, Include, Item } from 'data/contentTypes';
import * as persistence from 'data//persistence';
import { viewOrganizations } from 'actions/view';
import guid from 'utils/guid';
import { LegacyTypes } from 'data/types';

const createOrgDuplicate = (courseId: string, sourceModel: models.OrganizationModel)
  : models.OrganizationModel => {

  const g = guid();
  const title = 'Duplicate of ' + sourceModel.title;

  const id = courseId + '_' +
    title.toLowerCase().split(' ')[0] + '_'
    + g.substring(g.lastIndexOf('-') + 1);

  const { version, product, audience, labels } = sourceModel;

  const sequences = dupeSequences(sourceModel.sequences);

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

type OrgNode = Sequences | Sequence | Unit | Module | Include | Item;

function dupe(v: OrgNode) : OrgNode {

  if (v.contentType === 'Item') {
    return v.with({ guid: guid() });
  } else if (v.contentType === 'Sequences') {
    return v.with({ guid: guid() });
  }


}

export function duplicateOrganization(courseId: string, sourceModel: models.OrganizationModel) {
  return function (dispatch) {

    persistence.createDocument(courseId, createOrgDuplicate(courseId, sourceModel))
      .then(doc => viewOrganizations(courseId));

  };
}
