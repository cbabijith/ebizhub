/**
 * CacheService
 * 
 * NOTE: This is a lightweight, in-memory per-process cache designed for a single API instance.
 * It is not a distributed cache. If the production architecture scales to multiple API instances,
 * this service should be replaced with or backed by Redis or another shared distributed cache provider.
 */
export class CacheService {
  private static store = new Map<string, { value: any; expiresAt: number }>();

  static get<T>(key: string): T | undefined {
    const cached = this.store.get(key);
    if (!cached) return undefined;

    if (Date.now() > cached.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    return cached.value as T;
  }

  static set<T>(key: string, value: T, ttlSeconds: number): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
  }

  static delete(key: string): void {
    this.store.delete(key);
  }

  static deletePattern(pattern: string): void {
    for (const key of this.store.keys()) {
      if (key.includes(pattern)) {
        this.store.delete(key);
      }
    }
  }

  static clear(): void {
    this.store.clear();
  }

  static generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(k => `${k}:${String(params[k] ?? "")}`)
      .join("|");
    return `${prefix}:${sortedParams}`;
  }

  static invalidateDiscoveryCache(): void {
    this.deletePattern("home:");
    this.deletePattern("trending:");
    this.deletePattern("featured:");
    this.deletePattern("recent:");
    this.deletePattern("categories:");
    this.deletePattern("popular-categories:");
    this.deletePattern("recommendations:");
    this.deletePattern("search:suggestions");
  }
}
