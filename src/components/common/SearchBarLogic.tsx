import * as React from 'react';
import { Resource } from 'data/content/resource';
import { CourseDescription } from 'components/CoursesViewSearchable';

/** Split the text into matched/unmatched segments to allow each matched segment to be highlighted.
 *  Fn is memoized because we noticed performance issues when searching in larger courses.
 *  Raw strings are used to prevent performance issues seen with React.cloneElement
 */
const cache = {};
type RowData= Resource | CourseDescription;

export const highlightMatches = (prop: string, r: RowData, searchText): JSX.Element => {
  const textToSearchIn = r[prop];
  const lowercasedTextToSearchIn = textToSearchIn.trim().toLowerCase();
  const key = searchText + '|' + lowercasedTextToSearchIn;
  const divWith = value => <div dangerouslySetInnerHTML={ { __html: value } } />;

  if (cache[key]) {
    return divWith(cache[key]);
  }

  const searchTextExpression = new RegExp(searchText, 'i');
  const highlightedText =
    '<span>' +
      textToSearchIn.replace(searchTextExpression,
                             '<span class="searchMatch">' +
                               // Necessary to preserve case of matched text
                               textToSearchIn.match(searchTextExpression) +
                             '</span>') +
    '</span>';

  cache[key] = highlightedText;
  return divWith(cache[key]);
};
