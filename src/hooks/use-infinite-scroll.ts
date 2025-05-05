import { useEffect, useRef } from 'react'

/**
 * Custom hook for infinity scroll trigger
 * 
 * @param onIntersect - Function to be called when the element is intersected
 * @param enabled - Whether the hook is enabled
 * @returns A ref to the element to be observed
 */
export function useInfiniteScroll(onIntersect: () => void, enabled = true) {
  const observerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && enabled) {
          onIntersect()
        }
      },
      {
        rootMargin: '100px',
      }
    )

    const currentRef = observerRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [onIntersect, enabled])

  return observerRef
} 