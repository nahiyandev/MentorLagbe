const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function uploadImageToImgBB(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select a valid image file (PNG, JPG, WebP, etc.).");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("Image file size must be 5MB or smaller.");
  }

  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ImgBB API key is not configured (NEXT_PUBLIC_IMGBB_API_KEY)."
    );
  }

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      body: formData,
    }
  );

  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    data?: { display_url?: string; url?: string };
    error?: { message?: string };
  } | null;

  if (!response.ok || !result?.success || !result.data) {
    throw new Error(
      result?.error?.message || "Failed to upload image to ImgBB."
    );
  }

  const imageUrl = result.data.display_url || result.data.url;
  if (!imageUrl) {
    throw new Error("ImgBB did not return a valid image URL.");
  }

  return imageUrl;
}
