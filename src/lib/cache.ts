/**
 * Simple in-memory cache that can be extended to use Redis (e.g. Upstash)
 */
class CacheManager {
    private cache = new Map<string, { value: any, expires: number }>();

    set(key: string, value: any, ttlSeconds: number = 60) {
        this.cache.set(key, {
            value,
            expires: Date.now() + (ttlSeconds * 1000)
        });
    }

    get<T>(key: string): T | null {
        const item = this.cache.get(key);
        if (!item) return null;
        if (Date.now() > item.expires) {
            this.cache.delete(key);
            return null;
        }
        return item.value as T;
    }

    delete(key: string) {
        this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }
}

export const cacheManager = new CacheManager();
