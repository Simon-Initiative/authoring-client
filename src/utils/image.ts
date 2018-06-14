import { buildUrl } from 'utils/path';
import { AppContext } from 'editors/common/AppContext';

export interface ImageSize {
  width: number;
  height: number;
}

export const fetchImageSize = (src: string, context: AppContext): Promise<ImageSize> => {
  const fullSrc = buildUrl(
    context.baseUrl,
    context.courseId,
    context.resourcePath,
    src);
  const img = new (window as any).Image();
  return new Promise((resolve, reject) => {
    img.onload = () => {
      resolve({ height: img.height, width: img.width });
    };
    img.onerror = (err) => {
      reject(err);
    };
    img.src = fullSrc;
  });
};
