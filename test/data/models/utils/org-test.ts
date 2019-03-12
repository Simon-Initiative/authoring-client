
import * as contentTypes from 'data/contentTypes';
import { Maybe } from 'tsmonad';
import * as org from 'data/models/utils/org';
import { OrganizationModel } from 'data/models/org';

it('tests adding nodes', () => {

  const orgData = require('./sample.json');
  const model = OrganizationModel.fromPersistence(orgData, () => null);

  // Tests adding a unit
  expect((model.sequences.children.first() as contentTypes.Sequence).children.size).toBe(1);
  const u = new contentTypes.Unit();
  const result = org.applyChange(model, org.makeAddNode('sequence1', u, Maybe.nothing()));

  result.caseOf({
    just: m => expect((m.updatedModel.sequences.children.first() as contentTypes.Sequence)
      .children.size).toBe(2),
    nothing: () => fail('should have been valid'),
  });

  // Tests inserting a unit
  expect((model.sequences.children.first() as contentTypes.Sequence).children.size).toBe(1);
  const u2 = new contentTypes.Unit({ title: 'inserted unit' });
  const result2 = org.applyChange(model, org.makeAddNode('sequence1', u2, Maybe.just(0)));

  result2.caseOf({
    just: (m) => {
      const sequence = (m.updatedModel.sequences.children.first() as contentTypes.Sequence);
      expect(sequence.children.first().title).toBe('inserted unit');
    },
    nothing: () => fail('should have been valid'),
  });

  // Tests inserting a unit into a missing node
  expect((model.sequences.children.first() as contentTypes.Sequence).children.size).toBe(1);
  const u3 = new contentTypes.Unit({ title: 'inserted unit' });
  const result3 = org.applyChange(model, org.makeAddNode('thisiddoesnotexist', u3, Maybe.just(0)));

  result3.caseOf({
    just: (m) => {
      fail('should have been nothing');
      return true;
    },
    nothing: () => expect(1).toBe(1),
  });
});


it('tests removing nodes', () => {

  const orgData = require('./sample.json');
  const model = OrganizationModel.fromPersistence(orgData, () => null);

  // Tests removing a unit from a sequence
  expect((model.sequences.children.first() as contentTypes.Sequence).children.size).toBe(1);
  const result = org.applyChange(model, org.makeRemoveNode('lesson1'));

  result.caseOf({
    just: (m) => {
      expect((m.updatedModel.sequences.children.first() as contentTypes.Sequence)
        .children.size).toBe(0);
    },
    nothing: () => fail('should have been valid'),
  });

});

it('tests setting an attr', () => {

  const orgData = require('./sample.json');
  const model = OrganizationModel.fromPersistence(orgData, () => null);

  // Tests setting the title of a unit
  expect((model.sequences.children.first() as contentTypes.Sequence).children.size).toBe(1);
  const result = org.applyChange(
    model, org.makeUpdateNode(
      'lesson1',
      (e: any) => e.with({ title: 'ok' }),
      (e: any) => e.with({ title: '' }),
    ));

  result.caseOf({
    just: (m) => {
      expect((m.updatedModel.sequences.children.first() as contentTypes.Sequence)
        .children.first().title).toBe('ok');
    },
    nothing: () => fail('should have been valid'),
  });

});


it('tests reordering', () => {

  const orgData = require('./sample.json');
  const model = OrganizationModel.fromPersistence(orgData, () => null);

  // Tests reordering within a module
  const module = ((((model.sequences.children.first() as contentTypes.Sequence)
    .children.first()) as contentTypes.Unit).children.first()) as contentTypes.Module;
  const item = module.children.first() as contentTypes.Item;
  expect(module.children.size).toBe(3);

  const result = org.applyChange(model, org.makeMoveNode(item, 'introduction', 2));

  result.caseOf({
    just: (m) => {
      const module = ((((m.updatedModel.sequences.children.first() as contentTypes.Sequence)
        .children.first()) as contentTypes.Unit).children.first()) as contentTypes.Module;
      const firstItem = module.children.first() as contentTypes.Item;
      const lastItem = module.children.last() as contentTypes.Item;
      expect(firstItem.id).toBe('e9b1ed0598644ff3bbb9de10043734e0');
      expect(lastItem.id).toBe('d1146946467745eda151e488f0cf4134');
    },
    nothing: () => fail('should have been valid'),
  });

  // Tests reordering from a module into a unit
  const result2 = org.applyChange(model, org.makeMoveNode(item, 'lesson1', 0));

  result2.caseOf({
    just: (m) => {
      const item = ((((m.updatedModel.sequences.children.first() as contentTypes.Sequence)
        .children.first()) as contentTypes.Unit).children.first()) as contentTypes.Item;
      const module = ((((m.updatedModel.sequences.children.first() as contentTypes.Sequence)
        .children.first()) as contentTypes.Unit).children.last()) as contentTypes.Module;
      const firstItem = module.children.first() as contentTypes.Item;

      expect(module.title).toBe('Introduction');
      expect(item.id).toBe('d1146946467745eda151e488f0cf4134');
      expect(firstItem.id).toBe('e9b1ed0598644ff3bbb9de10043734e0');
    },
    nothing: () => fail('should have been valid'),
  });

});


