
/**
 * Returns an RFC4122 version 4 compliant GUID.
 * See http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 * for source and related discussion. 
 */
export default function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}