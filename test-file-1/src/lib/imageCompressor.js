/**
 * HTML5 Canvas Image Compression Utility for UNIMART
 * Resizes images to max 1024px on the longest dimension and compresses to JPEG ~0.7 quality.
 * Prevents base64 image bloat from overflowing localStorage (~5MB limit).
 */

export async function compressImage(file, maxDimension = 1024, quality = 0.7) {
  return new Promise((resolve, reject) => {
    // If not an image file, reject
    if (!file || !file.type || !file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image'));
    }

    const reader = new FileReader();
    reader.onerror = (err) => reject(err);
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = (err) => reject(err);
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
            return resolve(e.target.result); // Fallback to raw if canvas context unavailable
          }

          // Draw and compress to JPEG
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (compressionErr) {
          console.warn('Canvas compression failed, falling back to original data URL', compressionErr);
          resolve(e.target.result);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
