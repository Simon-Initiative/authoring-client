import { determineMimeTypeFromFilename as d } from '../../src/utils/mime';

it('Testing mimeType determination', () => {

  expect(() => { d(null); }).toThrowError('Invalid filename <empty>');
  expect(() => { d(undefined); }).toThrowError('Invalid filename <empty>');
  expect(() => { d(''); }).toThrowError('Invalid filename <empty>');
  expect(() => { d('a'); }).toThrowError('Missing extension');
  expect(() => { d('a.ThisExtensionDoesNotExist'); }).toThrow('Unknown extension');

  expect(d('some/long/path/file.mov')).toBe('video/quicktime');
  expect(d('.mov')).toBe('video/quicktime');

});
