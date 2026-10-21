/**
 * HTML5 Canvas Image Compression Utility for UNIMART
 * Resizes images to max 1200px on the longest dimension and compresses to JPEG ~0.75 quality.
 * Easily handles standard smartphone photos (3MB - 12MB) and converts them to crisp ~100-250KB images.
 */

export async function compressImage(file, maxDimension = 1200, quality = 0.75) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      return reject(new Error(`"${file?.name || 'File'}" is not a valid image.`));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Failed to read "${file.name}".`));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error(`Failed to load "${file.name}".`));
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve(e.target.result);
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (err) {
          resolve(e.target.result);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
