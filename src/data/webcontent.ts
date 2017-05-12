import * as Immutable from 'immutable';
import {FileNode} from "./file_node";

export type WebContentParams = {
  rev: number,
  guid: string,
  fileNode: FileNode,
};

export class WebContent extends Immutable.Record({contentType: 'WebContent',rev:0, guid: '', fileNode: new FileNode()}) {
  
  contentType: 'WebContent';
  rev: number;
  guid: string;
  fileNode: FileNode;
  
  constructor(params?: WebContentParams) {
    params ? super(params) : super();
  }

  with(values: WebContentParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object) : WebContent {
    let a = (root as any);
    return new WebContent({rev: a.rev, guid: a.guid, fileNode: FileNode.fromPersistence(a.fileNode)});
  }

  toPersistence() : Object {
    return {
      "rev": this.rev,
      "guid": this.guid,
      "fileNode": this.fileNode.toPersistence()
    }
  }
}
