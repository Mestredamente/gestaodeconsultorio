export async function measurePerformance<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now()
  try {
    const result = await fn()
    const duration = performance.now() - start
    if (duration > 2000) {
      console.warn(`[PERFORMANCE] ${name} demorou ${duration.toFixed(2)}ms (acima do limite de 2s)`)
    }
    return result
  } catch (error) {
    const duration = performance.now() - start
    console.error(`[PERFORMANCE ERROR] ${name} falhou após ${duration.toFixed(2)}ms`, error)
    throw error
  }
}
