import { Maybe } from 'tsmonad';
import { ContentParser, ParsedContent } from 'data/parsers/common/types';

const parse : ContentParser = (data: string) : Maybe<ParsedContent> => {
  return Maybe.nothing();
};

export default parse;
