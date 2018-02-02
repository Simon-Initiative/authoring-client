import * as Immutable from 'immutable';

export type FileNodeParams = {
  rev?: number,
  dateCreated?: string,
  dateUpdated?: string,
  guid?: string,
  pathTo?: string,
  fileName?: string;
  mimeType?: string,
  fileSize?: number,
};

export class FileNode extends Immutable.Record({
  contentType: 'FileNode', rev:0, dateCreated: '', dateUpdated: '', guid: '', pathTo: '',
  fileName: '', mimeType: '', fileSize: 0,
}) {

  contentType: 'FileNode';
  rev: number;
  dateCreated: string;
  dateUpdated: string;
  guid: string;
  pathTo: string;
  fileName: string;
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
      rev: a.rev, dateCreated: a.dateCreated, dateUpdated: a.dateUpdated, guid: a.guid,
      pathTo: a.pathTo, fileName: a.fileName, mimeType: a.mimeType, fileSize: a.fileSize,
    });
  }

  toPersistence() : Object {
    return {
      rev: this.rev,
      dateCreated: this.dateCreated,
      dateUpdated: this.dateUpdated,
      guid: this.guid,
      pathTo: this.pathTo,
      fileName: this.fileName,
      mimeType: this.mimeType,
      fileSize: this.fileSize,
    };
  }
}
