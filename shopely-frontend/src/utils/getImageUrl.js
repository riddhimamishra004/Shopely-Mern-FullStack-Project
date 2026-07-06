export function getImageUrl(image) {
  if (!image) return "https://placehold.co/600x600?text=No+Image";
  if (image.startsWith("http")) return image;
  // Relative path — served by backend
  return `/api/uploads${image.startsWith("/") ? image : "/" + image}`;
}
