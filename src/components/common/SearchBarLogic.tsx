import * as React from 'react';
import { Resource } from 'data/content/resource';

// Split the text into matched/unmatched segments to
// allow each matched segment to be highlighted
const cache = {};
export const highlightMatches = (prop: string, r: Resource): JSX.Element => {
  const textToSearchIn = r[prop].trim().toLowerCase();
  const { searchText } = this.state;
  const key = searchText + '|' + textToSearchIn;
  if (cache[key]) {
    return <div dangerouslySetInnerHTML={ { __html: cache[key] } } />;
  }

  const regExp = new RegExp(searchText);
  const value =
    '<span>' +
    textToSearchIn.replace(regExp, '<span class="searchMatch">' + searchText + '</span>') +
    '</span>';

  cache[key] = value;
  return <div dangerouslySetInnerHTML={ { __html: cache[key] } } />;
};

// Highlight the matched segment. Splitting text on a delimiter
// removes the delimiter from the resulting array, so we need to add
// it back in after each segment.
export const highlightMatch = (unmatchedText, matchedText, i, length, wholeText) => {
  return (
    '<span>' + unmatchedText +
    (i !== length - 1
      ? ('<span class="searchMatch">' + matchedText + '</span>')
      : '') +
    '</span>'
  );
};
