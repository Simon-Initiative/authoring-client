import { OrganizationModel } from 'data/models/org';

import { registerContentTypes } from 'data/registrar';

describe('organization', () => {
  it('should return flattened resources', () => {
    registerContentTypes();

    const organization = require('./organization.json');
    const model = OrganizationModel.fromPersistence(organization, () => null);

    const resources = model.getFlattenedResources();

    expect(resources.toJS()).toEqual([
      'a281e4f0165a4d819560b60b3b16c83d',
      'a34976d58e5340e096d12c9ff7b2dfc5',
      'newe3cd90b7c1ff4598be594f30888c0143',
      'calculusbda3cfe2419c42f5926e694553216593',
    ]);
  });

});
