import { Maybe } from 'tsmonad';
import * as org from 'data/models/utils/org';
import { OrganizationModel } from 'data/models/org';
import { map } from 'data/utils/map';


it('finds the parent container', () => {

  const orgData = require('./depth-3.json');
  const model = OrganizationModel.fromPersistence(orgData, () => null);

  let node = org.findContainerOrParent(model, Maybe.just('section'));
  expect(node.id).toBe('section');

  node = org.findContainerOrParent(model, Maybe.just('pageref'));
  expect(node.id).toBe('section');

});


it('does not translates modules to units', () => {

  const orgData = require('./depth-2.json');
  const model = OrganizationModel.fromPersistence(orgData, () => null);

  org.translateModulesToUnits(model).caseOf({
    just: m => fail('should have been nothing'),
    nothing: () => expect(1).toBe(1),
  });

});

it('translates modules to units and sections to modules', () => {

  const orgData = require('./depth-3.json');
  const model = OrganizationModel.fromPersistence(orgData, () => null);

  org.translateModulesToUnits(model).caseOf({
    just: (m) => {

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
      }, m as any);

      expect(moduleCount).toBe(1);
      expect(unitCount).toBe(1);
      expect(sectionCount).toBe(0);
    },
    nothing: () => fail('should have been just a model'),
  });


});
