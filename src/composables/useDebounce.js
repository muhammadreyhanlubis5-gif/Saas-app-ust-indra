import { ref, customRef } from 'vue'

/**
 * useDebounceFn
 * Debounces a function execution to prevent layout thrashing and unnecessary network requests.
 * Ideal for search inputs, grid drag-to-select, and window resize events.
 */
export function useDebounceFn(fn, delay = 250) {
  let timeoutId = null

  const debounced = (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, delay)
  }

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  return debounced
}

/**
 * useDebouncedRef
 * Creates a reactive ref that delays updating its value until `delay` ms have passed since the last change.
 */
export function useDebouncedRef(value, delay = 250) {
  let timeoutId = null
  return customRef((track, trigger) => {
    return {
      get() {
        track()
        return value
      },
      set(newValue) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          value = newValue
          trigger()
        }, delay)
      }
    }
  })
}
