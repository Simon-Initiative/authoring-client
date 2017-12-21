import * as Immutable from 'immutable';

export type FileNodeParams = {
  rev?: number,
  guid?: string,
  pathTo?: string,
  mimeType?: string,
  fileSize?: number,
};

export class FileNode extends Immutable.Record({
  contentType: 'FileNode',rev:0, guid: '', pathTo: '', mimeType: '', fileSize: 0,
}) {

  contentType: 'FileNode';
  rev: number;
  guid: string;
  pathTo: string;
  mimeType: string;
  fileSize: number;

  constructor(params?: FileNodeParams) {
    params ? super(params) : super();
  }

  with(values: FileNodeParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object) : FileNode {
    const a = (root as any);
    return new FileNode({
      rev: a.rev, guid: a.guid, pathTo: a.pathTo, mimeType: a.mimeType, fileSize: a.fileSize,
    });
  }

  toPersistence() : Object {
    return {
      rev: this.rev,
      guid: this.guid,
      pathTo: this.pathTo,
      mimeType: this.mimeType,
      fileSize: this.fileSize,
    };
  }
}
