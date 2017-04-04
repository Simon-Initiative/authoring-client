// Unit tests to ensure the content types and model objects correctly
// serialize to JSON and can correctly deserialize back from JSON

import * as contentTypes from '../src/data/contentTypes';
import * as models from '../src/data/models';

it('deserialization of WorkbookPageModel', () => {

  let wb = new models.WorkbookPageModel({ lock: {contentType: 'LockContent', lockedBy: 'alice', lockedAt: 123}, head: {contentType: 'TitleContent', title: {'#text': 'testing'}}} as any);
  
  expect(wb.head.title['#text']).toBe('testing');
  expect(wb.head instanceof contentTypes.TitleContent).toEqual(true);
  
  expect(wb.lock instanceof contentTypes.LockContent).toEqual(true);
  expect(wb.lock.lockedAt).toBe(123);
  expect(wb.lock.lockedBy).toBe('alice');
  
});

it('construction of WorkbookPageModel via content types', () => {
  
  let wb = new models.WorkbookPageModel({ head: new contentTypes.TitleContent({title: {'#text': 'testing'}})} as any);
  expect(wb.head.title['#text']).toBe('testing');
});


it('roundtrip of TitleContent', () => {

  let titleContent = new contentTypes.TitleContent({ title: {'#text': 'testing'}});
  expect(titleContent.title['#text']).toBe('testing');

  let json = titleContent.toJS();
  expect(json).toEqual({ title: {'#text': 'testing'}, contentType: 'TitleContent'});

  let obj = new contentTypes.TitleContent(json);
  expect(obj.title['#text']).toBe('testing');
  
});

it('roundtrip of HtmlContent', () => {

  let html = new contentTypes.HtmlContent();
  expect(html.body).toEqual({
      "#array": [{
        "p": {
            "#text": "Sample text"
          }
        }
      ]
  });
  

  let json = html.toJS();
  expect(json).toEqual({
    "body": {
      "#array": [
        {
          "p": {
            "#text": "Sample text"
          }
        }
      ]
    }
  });

});

