import { ContentElements } from 'data/content/common/elements';

// there was a design flaw in the original implementation of identifying
// drag and drops using the src filename. Because the version number was
// included in the filename, every revision to the DynaDropHTML
// file would require another check here to determine if it is a dyandrop file.
// Therefore, this filename has changed to a more generic, version-agnostic name:
// DynaDropHTML.js. But, we still need to check for older drag and drops that are
// still using the DynaDropHTML-1.0.js file. Checks for this filename should be
// done using the isSupportedDynaDropSrcFile function below.
export const OLD_DYNA_DROP_SRC_FILENAME = 'DynaDropHTML-1.0.js';
export const DYNA_DROP_SRC_FILENAME = 'DynaDropHTML.js';

export const isSupportedDynaDropSrcFile = (filepath: string) =>
  filepath.substr(filepath.length - DYNA_DROP_SRC_FILENAME.length) === DYNA_DROP_SRC_FILENAME
  || filepath.substr(filepath.length - OLD_DYNA_DROP_SRC_FILENAME.length)
    === OLD_DYNA_DROP_SRC_FILENAME;

export const containsDynaDropCustom = (modelBody: ContentElements) => modelBody.content.reduce(
  (acc, val) => {
    return acc || val.contentType === 'Custom' && isSupportedDynaDropSrcFile(val.src);
  },
  false,
);

export const isReplActivity = (filepath: string) => false;
