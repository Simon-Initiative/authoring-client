// Unit tests to ensure the content types and model objects correctly
// serialize to JSON and can correctly deserialize back from JSON

import * as contentTypes from '../src/data/contentTypes';
import * as models from '../src/data/models';

it('deserialization of WorkbookPageModel', () => {

  let wb = new models.WorkbookPageModel({ lock: {contentType: 'LockContent', lockedBy: 'alice', lockedAt: 123}, title: {contentType: 'TitleContent', text: 'testing'}} as any);
  
  expect(wb.head.title.text).toBe('testing');
  expect(wb.head.title instanceof contentTypes.TitleContent).toEqual(true);
  
  expect(wb.lock instanceof contentTypes.LockContent).toEqual(true);
  expect(wb.lock.lockedAt).toBe(123);
  expect(wb.lock.lockedBy).toBe('alice');
  
});

it('construction of WorkbookPageModel via content types', () => {
  
  let wb = new models.WorkbookPageModel({ title: new contentTypes.TitleContent({title: {text: 'testing'}})} as any);
  expect(wb.head.title.text).toBe('testing');
});


it('roundtrip of TitleContent', () => {

  let titleContent = new contentTypes.TitleContent({ title: {text: 'testing'}});
  expect(titleContent.title.text).toBe('testing');

  let json = titleContent.toJS();
  expect(json).toEqual({ text: 'testing', contentType: 'TitleContent'});

  let obj = new contentTypes.TitleContent(json);
  expect(obj.title.text).toBe('testing');
  
});

it('roundtrip of HtmlContent', () => {

  let html = new contentTypes.HtmlContent();
  expect(html.body).toEqual([{
    text: (
      'Sample text'
    ),
    type: 'unstyled',
    entityRanges: [],
  }]);
  expect(html.body).toEqual({});

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

