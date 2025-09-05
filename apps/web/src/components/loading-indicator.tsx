import { useEffect, useState } from "react"

interface LoadingIndicatorProps {
  isLoading?: boolean
  label?: string
  onExited?: () => void
}

export function LoadingIndicator({ label = "Carregando...", isLoading = false, onExited }: LoadingIndicatorProps) {
  const [shouldRender, setShouldRender] = useState(isLoading)

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (isLoading) {
      setShouldRender(true)
    } else {
      // wait out animation to remove the element
      timeout = setTimeout(() => {
        setShouldRender(false)
        onExited?.()
      }, 100)
    }

    return () => {
      clearTimeout(timeout)
    }
  }, [isLoading, onExited])

  if (!shouldRender) return null

  return (
    <div className="relative w-full">
      <div
        className="
          fixed left-1/2 -translate-x-1/2 bottom-4 flex items-center justify-center px-2 py-2 bg-muted/80 rounded-full 
          data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=open]:fade-in 
          data-[state=closed]:opacity-0 transition-opacity duration-100
        "
        role="status"
        aria-label={label}
        data-state={isLoading ? "open" : "closed"}
      >
        <div className="animate-spin rounded-full border-gray-300 border-t-primary mr-2 h-4 w-4 border-2" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  )
} 