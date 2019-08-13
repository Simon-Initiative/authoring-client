import { CourseGuid } from 'data/types';
// Centralizes the construction of URLs for webcontent resources
export function buildUrl(
  baseUrl: string,
  courseGuid: CourseGuid,
  resourcePath: string,
  file: string): string {

  // Handle legacy image content
  if (file.startsWith('..')) {
    return baseUrl
      + '/' + courseGuid.value()
      + '/' + resourcePath
      + '/' + file;

    // Absolute URLs
  }
  if (file.startsWith('http://') || file.startsWith('https://')) {
    return file;

    // Files uploaded via the course editor
  }

  return baseUrl
    + '/' + courseGuid.value()
    + '/' + file;
}
