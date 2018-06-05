import { Maybe } from 'tsmonad';
import { ContentElement } from 'data/content/common/interfaces';
import { ContentParser } from 'data/parsers/common/types';

import parseGoogleShets from 'data/parsers/google/sheets';

const parse : ContentParser = (data: string) : Maybe<ContentElement> => {
  return parseGoogleShets(data);
};

export default parse;
