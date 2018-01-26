import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import * as common from '../html/common';
import { ContiguousText } from '../html/contiguous';
import { Unsupported } from '../unsupported';
import guid from 'utils/guid';
import { HasGuid } from 'data/types';




export const CONTENT_TEXT = [...ELEMENTS_TEXT];

export const CONTENT_MIXED = [...ELEMENTS_MIXED];

export const CONTENT_FLOW = CONTENT_INLINE;
export const CONTENT_MATERIAL = CONTENT_INLINE;
export const CONTENT_BODY = [
  ...ELEMENTS_MIXED, ...ELEMENTS_BLOCK, ...ELEMENTS_MEDIA, ...ELEMENTS_LIST,
  ...ELEMENTS_SEMANTIC, 'wb:inline', 'activity', 'section'];



