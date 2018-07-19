import { ContentElements } from 'data/content/common/elements';

export const containsDynaDropCustom = (modelBody: ContentElements) => modelBody.content.reduce(
  (acc, val) => {
    return acc || val.contentType === 'Custom'
      && val.src.substr(val.src.length - 11) === 'DynaDrop.js';
  },
  false,
);
