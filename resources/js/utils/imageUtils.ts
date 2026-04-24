/**
 * Utility functions for handling image URLs and display
 */

/**
 * Constructs a proper image URL for profile images, company logos, etc.
 * Handles both relative and absolute URLs
 */
export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return '';
  
  // If it's already a full URL, check if it needs conversion
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    // Convert /storage/ to /media/ in full URLs
    if (imagePath.includes('/storage/')) {
      return imagePath.replace('/storage/', '/media/');
    }
    return imagePath;
  }
  
  // If it's a relative path starting with /, use as is (Storage::url() returns /storage/...)
  if (imagePath.startsWith('/')) {
    // Convert /storage/... to /media/... for better compatibility
    if (imagePath.startsWith('/storage/')) {
      return `/media/${imagePath.substring('/storage/'.length)}`;
    }
    // If already /media/, use as is
    if (imagePath.startsWith('/media/')) {
      return imagePath;
    }
    return imagePath;
  }
  
  // If it's already in storage folder (public disk) without leading slash
  if (imagePath.startsWith('storage/')) {
    return `${window.location.origin}/media/${imagePath.substring('storage/'.length)}`;
  }

  // If it's an avatars or uploads path from public disk
  if (imagePath.startsWith('avatars/')) {
    return `${window.location.origin}/media/${imagePath}`;
  }
  if (imagePath.startsWith('uploads/')) {
    return `${window.location.origin}/media/${imagePath}`;
  }

  // If it's a home or carousel path from public disk (HomeContent images)
  if (imagePath.startsWith('home/') || imagePath.startsWith('carousel/')) {
    return `${window.location.origin}/media/${imagePath}`;
  }

  // If it's a developers path from public disk (Developer profile images)
  if (imagePath.startsWith('developers/')) {
    return `${window.location.origin}/media/${imagePath}`;
  }

  // Default: assume it's a relative path
  return `${window.location.origin}/${imagePath}`;
}

/**
 * Gets a fallback image URL for when the primary image fails to load
 */
export function getFallbackImageUrl(): string {
  // Return empty string to avoid 404 errors - let the AvatarFallback handle display
  return '';
}

/**
 * Handles image loading errors by providing fallback
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackUrl?: string
): void {
  const img = event.currentTarget;
  if (img.src !== fallbackUrl) {
    img.src = fallbackUrl || getFallbackImageUrl();
  }
}

/**
 * Validates if an image URL is accessible
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}
