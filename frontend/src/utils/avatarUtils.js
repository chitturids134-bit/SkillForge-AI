/**
 * Formats avatar photo URLs so relative server uploads (/uploads/...) 
 * resolve cleanly against the backend API server.
 */
export const getAvatarUrl = (photoPath) => {
  if (!photoPath || typeof photoPath !== 'string' || !photoPath.trim()) return null;
  const trimmed = photoPath.trim();
  if (trimmed.startsWith('data:image/') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('/uploads')) {
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5004').replace(/\/api\/?$/, '');
    return `${baseUrl}${trimmed}`;
  }
  return trimmed;
};
