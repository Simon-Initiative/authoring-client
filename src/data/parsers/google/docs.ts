import { Maybe } from 'tsmonad';
import { ContentElement } from 'data/content/common/interfaces';
import { ContentParser } from 'data/parsers/common/types';

const parse : ContentParser = (data: string) : Maybe<ContentElement> => {
  return Maybe.nothing();
};

export default parse;
