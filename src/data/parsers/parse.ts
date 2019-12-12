import { Maybe } from 'tsmonad';
import { ContentParser, ParsedContent } from 'data/parsers/common/types';

import parseMicrosoftWord from 'data/parsers/microsoft/word';
import parseMicrosoftExcel from 'data/parsers/microsoft/excel';

// The only parse routine that client code needs to call.
const parse : ContentParser = (data: string) : Maybe<ParsedContent> => {

  const word = parseMicrosoftWord(data);
  if (!word.equals(Maybe.nothing())) {
    return word;
  }

  const excel = parseMicrosoftExcel(data);
  if (!excel.equals(Maybe.nothing())) {
    return excel;
  }

  return Maybe.nothing();
};

export default parse;
