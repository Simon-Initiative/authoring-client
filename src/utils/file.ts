
// Extract base64 encoded data from a file selection input

export function fileToBase64(file: Blob) : Promise<string> {
  
  return new Promise((resolve, reject) => {
    
    const reader = new FileReader();

    reader.addEventListener('load', () => {
      const result = reader.result;
      const base64data = result.substring(result.indexOf(',') + 1);
      resolve(base64data);
    }, false);

    reader.addEventListener('error', () => {
      reject(reader.error);
    }, false);

    reader.readAsDataURL(file);
    
  });
}
