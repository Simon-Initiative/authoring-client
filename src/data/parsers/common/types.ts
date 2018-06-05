import { Maybe } from 'tsmonad';
import { ContentElement } from 'data/content/common/interfaces';

// A content parser is a function that takes a piece of string data
// and tries to parse and convert it into a hierarchy of content elements,
// rooted at a single content element

export type ContentParser = (data: string) => Maybe<ContentElement>;
