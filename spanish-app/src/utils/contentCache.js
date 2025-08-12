export const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const CACHE_PREFIX = 'learningContent:';

// Simple in-memory cache to avoid repeated parsing within a session
const memoryCache = new Map(); // chapterIndex -> { data, expiresAt }

export async function loadChapterContent(chapterIndex) {
  const now = Date.now();
  const key = `${CACHE_PREFIX}${chapterIndex}`;

  // 1) Memory cache
  const memEntry = memoryCache.get(chapterIndex);
  if (memEntry && memEntry.expiresAt > now) {
    return memEntry.data;
  }

  // 2) localStorage cache
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const { data, expiresAt } = JSON.parse(raw);
      if (expiresAt > now) {
        memoryCache.set(chapterIndex, { data, expiresAt });
        return data;
      } else {
        localStorage.removeItem(key);
      }
    }
  } catch (e) {
    // ignore storage issues
  }

  // 3) Load dynamically
  try {
    const mod = await import(`../json-files/${chapterIndex}-learningContent.json`);
    const learningContent = mod.default || mod;
    const data = learningContent[chapterIndex] || learningContent[String(chapterIndex)] || null;
    if (data) {
      const expiresAt = now + CACHE_TTL_MS;
      memoryCache.set(chapterIndex, { data, expiresAt });
      try {
        localStorage.setItem(key, JSON.stringify({ data, expiresAt }));
      } catch (e) {
        // storage may be full; ignore
      }
      return data;
    }
    return null;
  } catch (err) {
    console.error('Failed to load learning content for chapter', chapterIndex, err);
    return null;
  }
} 