import { Maybe } from 'tsmonad';
import * as Immutable from 'immutable';
import { ContentElement } from 'data/content/common/interfaces';


// A content parser is a function that takes a piece of string data
// and tries to parse and convert it into a collection of content elements
export type ContentParser = (data: string) => Maybe<ParsedContent>;

// Successfully parsing content yields a list of content elements and a
// list of content dependencies that must be resolved prior to 'saving' the content
export type ParsedContent = {
  elements: Immutable.List<ContentElement>,
  dependencies: Immutable.List<ContentDependency>,
};

// Content dependencies
export type ContentDependency = Base64EncodedBlob | RemoteResource;

// A base64 encoded blob of data. This dependency needs to be unencoded and
// uploaded into the media library before it is resolved. The guid points to the
// element in the ContentElement collection that this blob pertains to.
export type Base64EncodedBlob = {
  type: 'Base64EncodedBlob',
  data: string,
  guid: string,
};

// A remotely resoource, specified by a URL. This resource must be downloaded, then
// uploaded into the media library before it is resolved. The guid points to the
// element in the ContentElement collection that this resource pertains to.
export type RemoteResource = {
  type: 'RemoteResource',
  url: string,
  guid: string,
};
