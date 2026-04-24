/**
 * Optimizes a Cloudinary URL by adding auto-format and auto-quality parameters.
 * If the URL is not from Cloudinary, it returns the original URL.
 *
 * @param url The original image URL
 * @param width Optional width for resizing
 * @param height Optional height for resizing
 * @returns The optimized URL string
 */
export const getOptimizedImage = (
  url: string | undefined,
  width?: number,
  height?: number,
): string => {
  if (!url) return "";

  // Only optimize Cloudinary URLs
  if (url.includes("cloudinary.com")) {
    const parts = url.split("/upload/");
    if (parts.length === 2) {
      let transformations = "f_auto,q_auto";

      if (width && height) {
        transformations += `,w_${width},h_${height},c_fill`;
      } else if (width) {
        transformations += `,w_${width},c_scale`;
      } else if (height) {
        transformations += `,h_${height},c_scale`;
      }

      return `${parts[0]}/upload/${transformations}/${parts[1]}`;
    }
  }

  return url;
};

