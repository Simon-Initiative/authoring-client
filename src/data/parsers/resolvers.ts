import * as Immutable from 'immutable';
import { ContentDependency, Base64EncodedBlob, RemoteResource } from './common/types';
import { createWebContent } from 'data/persistence';
import { adjustPath } from 'editors/content/media/utils';
import createGuid from 'utils/guid';
import { CourseIdVers } from 'data/types';

const fetch = (window as any).fetch;

export type ResolvedDependency = {
  dependency: ContentDependency,
  src: string,
};

export type ResolverStatus = 'Succeeded' | 'Failed';

export type ResolverProgress = {
  dependency: ContentDependency,
  status: ResolverStatus,
};

export type ProgressCallback = (progress: ResolverProgress) => void;

// Execute an array of functions that return promises in series
const promiseSerial = funcs =>
  funcs.reduce(
    (promise, func) =>
      promise.then(result =>
        func().then(Array.prototype.concat.bind(result))),
    Promise.resolve([]));


// Resolve all dependencies in series.
export function resolveDependencies(
  dependencies: Immutable.List<ContentDependency>,
  courseId: CourseIdVers,
  resourcePath: string,
  progressCallback: ProgressCallback)
  : Promise<Immutable.List<ResolvedDependency>> {

  const resolvers = dependencies
    .toArray()
    .map((d) => {
      if (d.type === 'RemoteResource') {
        return () => resolveRemote(d, courseId, resourcePath, progressCallback);
      }
      return () => resolveBlob(d as Base64EncodedBlob, courseId, resourcePath);
    });

  return new Promise((resolve, reject) => {
    promiseSerial(resolvers)
      .then(results => resolve(Immutable.List<ResolvedDependency>(results)));
  });
}

function blobToFile(theBlob: Blob, fileName: string): File {
  return new File([theBlob], fileName);
}

function resolveBlob(
  dependency: Base64EncodedBlob, courseId: CourseIdVers,
  resourcePath: string): Promise<ResolvedDependency> {
  // Stub
  return Promise.resolve({ dependency, src: '' });
}

function resolveRemote(
  dependency: RemoteResource, courseId: CourseIdVers,
  resourcePath: string, progressCallback: ProgressCallback): Promise<ResolvedDependency> {

  // Fetch the remote file, then upload it as webcontent
  return new Promise((resolve, reject) => {
    fetch(dependency.url)
      .then(response => response.blob())
      .then((blob: Blob) => {

        // Get the file extension off of the blob type attribute, which is
        // of the form 'image/png', or 'image/jpg', etc.
        const slashIndex = blob.type.indexOf('/');
        const extension = slashIndex !== -1 && slashIndex < blob.type.length - 1
          ? blob.type.substr(blob.type.indexOf('/') + 1)
          : 'png';

        // Create a unique name using a portion of a guid
        const name = createGuid().substr(10) + '.' + extension;

        return createWebContent(courseId, blobToFile(blob, name));
      })
      .then((src) => {

        progressCallback({ dependency, status: 'Succeeded' });

        resolve({
          dependency,
          src: adjustPath(src, resourcePath),
        });
      })
      .catch((err) => {

        progressCallback({ dependency, status: 'Failed' });

        resolve({
          dependency,
          src: dependency.url,
        });
      });
  });

}


