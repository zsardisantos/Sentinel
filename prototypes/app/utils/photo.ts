// Shrink a phone photo (often 4,000 px and 3 MB) to about 1,000 px so it fits in browser storage
// and is small enough for the AI review in Piece 3. Returns a JPEG data URL.
export async function downscalePhoto(file: File, maxSide = 1000, quality = 0.72): Promise<string> {
  // imageOrientation "from-image" applies the phone's rotation tag so portrait photos stay upright.
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", quality);
}
