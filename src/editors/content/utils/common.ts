import { ContentElements } from 'data/content/common/elements';

export const DYNA_DROP_SRC_FILENAME = 'DynaDropHTML-1.1.js';

export const containsDynaDropCustom = (modelBody: ContentElements) => modelBody.content.reduce(
  (acc, val) => {
    return acc || val.contentType === 'Custom'
      && val.src.substr(val.src.length - DYNA_DROP_SRC_FILENAME.length) === DYNA_DROP_SRC_FILENAME;
  },
  false,
);
