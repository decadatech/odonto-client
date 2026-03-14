"use client"

import { motion, useMotionTemplate, type MotionValue } from "motion/react"
import { createPortal } from "react-dom"

import type { ScheduleAppointment } from "@/components/schedule/types"
import { ScheduleEventCard } from "@/components/schedule/schedule-event-card"

interface ScheduleDragPreviewProps {
  appointment: ScheduleAppointment
  x: MotionValue<number>
  y: MotionValue<number>
  width: MotionValue<number>
  height: MotionValue<number>
}

export function ScheduleDragPreview({
  appointment,
  x,
  y,
  width,
  height,
}: ScheduleDragPreviewProps) {
  const transform = useMotionTemplate`translate(${x}px, ${y}px)`

  return createPortal(
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-50"
      style={{
        transform,
        width,
        height,
      }}
    >
      <ScheduleEventCard
        appointment={appointment}
        isPreview
        className="size-full"
      />
    </motion.div>,
    document.body,
  )
}
