"use client"

import { addMinutes, startOfDay } from "date-fns"
import { motion, useMotionTemplate, useMotionValue, type PanInfo } from "motion/react"
import { useLayoutEffect, useRef, useState, type RefObject } from "react"

import { cn } from "@workspace/ui/lib/utils"

import { ScheduleDragPreview } from "./components/schedule-drag-preview"
import { ScheduleEventCard } from "@/components/schedule/schedule-event-card"
import { useDraggable } from "@/components/schedule/hooks/use-draggable"
import { useVerticalResizable } from "@/components/schedule/hooks/use-vertical-resizable"
import type { ScheduleAppointment } from "@/components/schedule/types"
import { toDate } from "@/components/schedule/utils"

interface DraggableScheduleEventProps {
  appointment: ScheduleAppointment
  baseTop: number
  baseHeight: number
  zIndex: number
  dayIndex: number
  days: Date[]
  dayColumnRefs: Array<RefObject<HTMLDivElement | null>>
  gridHeight: number
  startHour: number
  pixelsPerMinute: number
  snapHeight: number
  minimumHeight: number
  onAppointmentClick?: (appointment: ScheduleAppointment) => void
  onAppointmentMove?: (appointmentId: string, start: Date, end: Date) => void
  onInteractionEnd?: () => void
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function DraggableScheduleEvent({
  appointment,
  baseTop,
  baseHeight,
  zIndex,
  dayIndex,
  days,
  dayColumnRefs,
  gridHeight,
  startHour,
  pixelsPerMinute,
  snapHeight,
  minimumHeight,
  onAppointmentClick,
  onAppointmentMove,
  onInteractionEnd,
}: DraggableScheduleEventProps) {
  const containerRef = dayColumnRefs[dayIndex]
  const eventElementRef = useRef<HTMLDivElement | null>(null)

  if (!containerRef) {
    return null
  }

  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isInteracting, setIsInteracting] = useState(false)

  const left = useMotionValue(0)
  const top = useMotionValue(0)
  const height = useMotionValue(baseHeight)

  const grabOffsetX = useMotionValue(0)
  const grabOffsetY = useMotionValue(0)
  const previewX = useMotionValue(0)
  const previewY = useMotionValue(0)
  const previewWidth = useMotionValue(0)
  const previewHeight = useMotionValue(0)

  const transform = useMotionTemplate`translate(${left}px, ${top}px)`

  function getSnappedHeight() {
    return Math.max(
      minimumHeight,
      Math.round(height.get() / snapHeight) * snapHeight,
    )
  }

  function commitResize() {
    if (!onAppointmentMove) {
      return
    }

    const appointmentStart = toDate(appointment.start)
    const snappedHeight = getSnappedHeight()
    const snappedTopOffset = Math.round(top.get() / snapHeight) * snapHeight
    const nextTop = clamp(baseTop + snappedTopOffset, 0, gridHeight - snappedHeight)
    const startMinutes = startHour * 60 + Math.round(nextTop / pixelsPerMinute)
    const durationMinutes = Math.round(snappedHeight / pixelsPerMinute)
    const dayStart = startOfDay(appointmentStart)
    const start = addMinutes(dayStart, startMinutes)
    const end = addMinutes(start, durationMinutes)

    onAppointmentMove(appointment.id, start, end)
  }

  const onDragStart = (_event: PointerEvent, info: PanInfo) => {
    if (!eventElementRef.current) {
      return
    }

    setIsInteracting(true)
    setIsDragging(true)

    const rect = eventElementRef.current.getBoundingClientRect()

    previewWidth.set(rect.width)
    previewHeight.set(rect.height)

    grabOffsetX.set(info.point.x - (rect.left - left.get()))
    grabOffsetY.set(info.point.y - (rect.top - top.get()))

    previewX.set(info.point.x - grabOffsetX.get())
    previewY.set(info.point.y - grabOffsetY.get())

    left.set(0)
    top.set(0)
  }

  const onDrag = (_event: PointerEvent, info: PanInfo) => {
    previewX.set(info.point.x - grabOffsetX.get())
    previewY.set(info.point.y - grabOffsetY.get())
  }

  const onDragEnd = (_event: PointerEvent, info: PanInfo) => {
    setIsDragging(false)
    setIsInteracting(false)
    onInteractionEnd?.()

    if (!onAppointmentMove) {
      return
    }

    previewX.set(info.point.x - grabOffsetX.get())
    previewY.set(info.point.y - grabOffsetY.get())

    const targetColumnIndex = dayColumnRefs.findIndex(({ current }) => {
      if (!current) {
        return false
      }

      const rect = current.getBoundingClientRect()

      return info.point.x >= rect.left && info.point.x <= rect.right
    })

    if (targetColumnIndex < 0) {
      return
    }

    const targetColumn = dayColumnRefs[targetColumnIndex]?.current
    const targetDay = days[targetColumnIndex]

    if (!targetColumn || !targetDay) {
      return
    }

    const relativeOffset = info.point.y - targetColumn.getBoundingClientRect().top - grabOffsetY.get()

    if (!Number.isFinite(relativeOffset)) {
      return
    }

    const snappedHeight = getSnappedHeight()
    const nextTop = clamp(
      Math.round(relativeOffset / snapHeight) * snapHeight,
      0,
      gridHeight - snappedHeight,
    )

    const startMinutes = startHour * 60 + Math.round(nextTop / pixelsPerMinute)
    const durationMinutes = Math.round(snappedHeight / pixelsPerMinute)
    const dayStart = startOfDay(targetDay)
    const start = addMinutes(dayStart, startMinutes)
    const end = addMinutes(start, durationMinutes)

    onAppointmentMove(appointment.id, start, end)

    return false
  }

  const { onPanStart, onPan, onPanEnd } = useDraggable({
    containerRef,
    left,
    top,
    onDragStart,
    onDrag,
    onDragEnd,
  })

  const handles = useVerticalResizable({
    containerRef,
    top,
    height,
    onResizeStart: () => {
      setIsInteracting(true)
      setIsResizing(true)
    },
    onTopResizeEnd: () => {
      setIsResizing(false)
      setIsInteracting(false)
      onInteractionEnd?.()
      commitResize()
    },
    onBottomResizeEnd: () => {
      setIsResizing(false)
      setIsInteracting(false)
      onInteractionEnd?.()
      commitResize()
    },
  })

  useLayoutEffect(() => {
    top.set(0)
    left.set(0)
    height.set(baseHeight)
  }, [
    appointment.end,
    appointment.start,
    appointment.title,
    baseHeight,
    height,
    left,
    top,
  ])

  return (
    <>
      {isDragging ? (
        <ScheduleDragPreview
          appointment={appointment}
          x={previewX}
          y={previewY}
          width={previewWidth}
          height={previewHeight}
        />
      ) : null}

      <motion.div
        ref={eventElementRef}
        className={cn(
          "absolute left-1 right-1",
          isDragging && "pointer-events-none opacity-0",
        )}
        style={{
          top: baseTop,
          height,
          transform,
          zIndex,
        }}
      >
        <ScheduleEventCard
          appointment={appointment}
          onClick={onAppointmentClick}
          onPointerDownCapture={() => setIsInteracting(true)}
          onPointerUpCapture={() => {
            if (!isDragging && !isResizing) {
              setIsInteracting(false)
            }
          }}
          onPointerCancelCapture={() => setIsInteracting(false)}
          isDragging={isDragging}
          isResizing={isResizing}
          isInteracting={isInteracting}
          className="size-full"
        >
          <motion.div
            className="absolute inset-0 touch-none"
            onPanStart={onPanStart}
            onPan={onPan}
            onPanEnd={onPanEnd}
          />
          <motion.div
            className="absolute inset-x-0 top-0 h-[min(15%,0.25rem)] cursor-row-resize touch-none"
            onPanStart={handles.top.onPanStart}
            onPan={handles.top.onPan}
            onPanEnd={handles.top.onPanEnd}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 h-[min(15%,0.25rem)] cursor-row-resize touch-none"
            onPanStart={handles.bottom.onPanStart}
            onPan={handles.bottom.onPan}
            onPanEnd={handles.bottom.onPanEnd}
          />
        </ScheduleEventCard>
      </motion.div>
    </>
  )
}
