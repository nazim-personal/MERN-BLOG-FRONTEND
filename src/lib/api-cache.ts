type CacheEntry<T> = {
    data: T;
    timestamp: number;
};

class ApiCache {
    private cache: Map<string, CacheEntry<unknown>> = new Map();
    private defaultTTL: number = 5 * 60 * 1000; // 5 minutes default TTL

    set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now() + ttl,
        });
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (Date.now() > entry.timestamp) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }
}

export const apiCache = new ApiCache();
