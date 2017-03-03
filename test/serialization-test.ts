// Unit tests to ensure the content types and model objects correctly
// serialize to JSON and can correctly deserialize back from JSON

import * as contentTypes from '../src/data/contentTypes';
import * as models from '../src/data/models';

it('deserialization of WorkbookPageModel', () => {

  let wb = new models.WorkbookPageModel({ lock: {contentType: 'LockContent', lockedBy: 'alice', lockedAt: 123}, title: {contentType: 'TitleContent', text: 'testing'}} as any);
  
  expect(wb.title.text).toBe('testing');
  expect(wb.title instanceof contentTypes.TitleContent).toEqual(true);
  
  expect(wb.lock instanceof contentTypes.LockContent).toEqual(true);
  expect(wb.lock.lockedAt).toBe(123);
  expect(wb.lock.lockedBy).toBe('alice');
  
});

it('construction of WorkbookPageModel via content types', () => {
  
  let wb = new models.WorkbookPageModel({ title: new contentTypes.TitleContent({text: 'testing'})} as any);
  expect(wb.title.text).toBe('testing');
});


it('roundtrip of TitleContent', () => {

  let titleContent = new contentTypes.TitleContent({ text: 'testing'});
  expect(titleContent.text).toBe('testing');

  let json = titleContent.toJS();
  expect(json).toEqual({ text: 'testing', contentType: 'TitleContent'});

  let obj = new contentTypes.TitleContent(json);
  expect(obj.text).toBe('testing');
  
});

it('roundtrip of HtmlContent', () => {

  let html = new contentTypes.HtmlContent();
  expect(html.blocks).toEqual([{
    text: (
      'Sample text'
    ),
    type: 'unstyled',
    entityRanges: [],
  }]);
  expect(html.entityMap).toEqual({});

  let json = html.toJS();
  expect(json).toEqual({
    blocks: [{
      text: (
        'Sample text'
      ),
      type: 'unstyled',
      entityRanges: [],
    }], 
    entityMap: {},
    contentType: 'HtmlContent'
  });

});

