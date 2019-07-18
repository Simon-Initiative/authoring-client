
import * as contentTypes from 'data/contentTypes';
import { Maybe } from 'tsmonad';
import * as org from 'data/models/utils/org';
import { OrganizationModel } from 'data/models/org';
import { map } from 'data/utils/map';

it('calculates depths', () => {

  [1, 2, 3].forEach((n) => {
    const orgData = require('./depth-' + n + '.json');
    const model = OrganizationModel.fromPersistence(orgData, () => null);

    expect(org.calcDepth(model.sequences.children.first() as contentTypes.Sequence)).toBe(+n);
  });

});


it('finds the parent container', () => {

  const orgData = require('./depth-3.json');
  const model = OrganizationModel.fromPersistence(orgData, () => null);

  let node = org.findContainerOrParent(model, Maybe.just('section'));
  expect(node.id).toBe('section');

  node = org.findContainerOrParent(model, Maybe.just('page'));
  expect(node.id).toBe('section');

});


it('can insert a child', () => {

  const orgData = require('./depth-3.json');
  const model = OrganizationModel.fromPersistence(orgData, () => null);

  const node = org.findContainerOrParent(model, Maybe.just('section'));

  const item = new contentTypes.Include({ id: 'include' });
  const updated = org.insertAsChild(model, node, item);

  const section = org.findContainerOrParent(updated, Maybe.just('include'));
  expect(section.id).toBe('section');

});



it('does not translates modules to units', () => {

  const orgData = require('./depth-2.json');
  const model = OrganizationModel.fromPersistence(orgData, () => null);

  const updated = org.translateModulesToUnits(model);

  let moduleCount = 0;
  let unitCount = 0;

  map((e) => {
    if (e.contentType === 'Unit') {
      unitCount += 1;
    }
    if (e.contentType === 'Module') {
      moduleCount += 1;
    }
    return e;
  }, updated as any);

  expect(moduleCount).toBe(1);
  expect(unitCount).toBe(0);

});

it('translates modules to units and sections to modules', () => {

  const orgData = require('./depth-3.json');
  const model = OrganizationModel.fromPersistence(orgData, () => null);

  const updated = org.translateModulesToUnits(model);

  let moduleCount = 0;
  let unitCount = 0;
  let sectionCount = 0;

  map((e) => {
    if (e.contentType === 'Unit') {
      unitCount += 1;
    }
    if (e.contentType === 'Module') {
      moduleCount += 1;
    }
    if (e.contentType === 'Section') {
      sectionCount += 1;
    }
    return e;
  }, updated as any);

  expect(moduleCount).toBe(1);
  expect(unitCount).toBe(1);
  expect(sectionCount).toBe(0);

});
