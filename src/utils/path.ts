
export function buildUrl(
  baseUrl: string,
  courseId: string,
  resourcePath: string,
  file: string) : string {

  // Handle legacy image content
  if (file.startsWith('..')) {
    return baseUrl 
      + '/' + courseId
      + '/' + resourcePath 
      + '/' + file;
  
  // Absolute URLs
  } else if (file.startsWith('http://') || file.startsWith('https://')) {
    return file;

  // Files uploaded via the course editor
  } else {
    return baseUrl 
      + '/' + courseId
      + '/' + file;
  }

}
