import { unstable_cache } from 'next/cache'

// Cache configuration
const CACHE_TAGS = {
  user: 'user',
  tenant: 'tenant',
  appointments: 'appointments',
  services: 'services',
  employees: 'employees',
  clients: 'clients',
  analytics: 'analytics',
} as const

// Cache durations (in seconds)
const CACHE_DURATIONS = {
  short: 30, // 30 seconds - for frequently changing data
  medium: 60, // 1 minute - for moderately changing data
  long: 300, // 5 minutes - for rarely changing data
} as const

/**
 * Create a cached function with automatic revalidation
 */
export function createCachedFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyPrefix: string,
  tags: string[],
  duration: number = CACHE_DURATIONS.medium
): T {
  return ((...args: any[]) => {
    const cacheKey = `${keyPrefix}-${JSON.stringify(args)}`
    return unstable_cache(
      async () => fn(...args),
      [cacheKey],
      {
        tags,
        revalidate: duration,
      }
    )()
  }) as T
}

/**
 * Invalidate cache by tags
 */
export function invalidateCache(tags: string[]) {
  // This will be handled by Next.js revalidateTag
  return { tags }
}

export { CACHE_TAGS, CACHE_DURATIONS }

