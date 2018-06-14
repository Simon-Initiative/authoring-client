import { Maybe } from 'tsmonad';
import { ContentParser, ParsedContent } from 'data/parsers/common/types';

import parseGoogleSheets from 'data/parsers/google/sheets';
import parseGoogleDocs from 'data/parsers/google/docs';
import parseMicrosoftWord from 'data/parsers/microsoft/word';
import parseMicrosoftExcel from 'data/parsers/microsoft/excel';

// The only parse routine that client code needs to call.
const parse : ContentParser = (data: string) : Maybe<ParsedContent> => {

  const sheets = parseGoogleSheets(data);
  if (!sheets.equals(Maybe.nothing())) {
    return sheets;
  }

  const docs = parseGoogleDocs(data);
  if (!docs.equals(Maybe.nothing())) {
    return docs;
  }

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
