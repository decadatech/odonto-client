"use client"

import { useRef, type RefObject } from "react"

import { type MotionValue, type PanInfo, useMotionValue } from "motion/react"

interface UseVerticalResizableOptions {
  containerRef: RefObject<HTMLElement | null>
  top: MotionValue<number>
  height: MotionValue<number>
  disabled?: boolean
  onResizeStart?: (direction: "top" | "bottom") => void
  onTopResizeEnd?: (delta: number) => void
  onBottomResizeEnd?: (delta: number) => void
}

export function useVerticalResizable({
  containerRef,
  top,
  height,
  disabled = false,
  onResizeStart,
  onTopResizeEnd: onTopResizeEndCallback,
  onBottomResizeEnd: onBottomResizeEndCallback,
}: UseVerticalResizableOptions) {
  const originY = useMotionValue(0)
  const relativeY = useMotionValue(0)
  const initialHeight = useMotionValue(height.get())
  const isResizingRef = useRef(false)

  function onResizeTopStart(event: PointerEvent, info: PanInfo) {
    if (!containerRef.current || disabled) {
      return
    }

    event.preventDefault()

    onResizeStart?.("top")
    document.body.style.cursor = "row-resize"

    if (isResizingRef.current) {
      return
    }

    isResizingRef.current = true

    const rect = containerRef.current.getBoundingClientRect()

    initialHeight.set(height.get())
    originY.set(info.point.y - info.offset.y - rect.top)
  }

  function onResizeBottomStart(event: PointerEvent, info: PanInfo) {
    if (!containerRef.current || disabled) {
      return
    }

    event.preventDefault()

    onResizeStart?.("bottom")
    document.body.style.cursor = "row-resize"

    if (isResizingRef.current) {
      return
    }

    isResizingRef.current = true

    const rect = containerRef.current.getBoundingClientRect()

    initialHeight.set(height.get())
    originY.set(info.point.y - info.offset.y - rect.top)
  }

  function onResizeTop(_event: PointerEvent, info: PanInfo) {
    if (!containerRef.current || disabled) {
      return
    }

    const rect = containerRef.current.getBoundingClientRect()

    if (!isResizingRef.current) {
      isResizingRef.current = true

      initialHeight.set(height.get())
      originY.set(info.point.y - info.offset.y - rect.top)
    }

    relativeY.set(info.point.y - rect.top)

    const delta = relativeY.get() - originY.get()

    height.set(initialHeight.get() - delta)
    top.set(delta)
  }

  function onResizeBottom(_event: PointerEvent, info: PanInfo) {
    if (!containerRef.current || disabled) {
      return
    }

    const rect = containerRef.current.getBoundingClientRect()

    if (!isResizingRef.current) {
      isResizingRef.current = true

      initialHeight.set(height.get())
      originY.set(info.point.y - info.offset.y - rect.top)
    }

    relativeY.set(info.point.y - rect.top)

    const delta = relativeY.get() - originY.get()

    height.set(initialHeight.get() + delta)
  }

  function onResizeTopEnd() {
    isResizingRef.current = false

    document.body.style.removeProperty("cursor")

    onTopResizeEndCallback?.(relativeY.get() - originY.get())

    originY.set(0)
    relativeY.set(0)
    initialHeight.set(0)
  }

  function onResizeBottomEnd() {
    isResizingRef.current = false

    document.body.style.removeProperty("cursor")

    onBottomResizeEndCallback?.(relativeY.get() - originY.get())

    originY.set(0)
    relativeY.set(0)
  }

  return {
    top: {
      onPanStart: onResizeTopStart,
      onPan: onResizeTop,
      onPanEnd: onResizeTopEnd,
    },
    bottom: {
      onPanStart: onResizeBottomStart,
      onPan: onResizeBottom,
      onPanEnd: onResizeBottomEnd,
    },
  }
}
