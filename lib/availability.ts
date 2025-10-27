import { db } from "./db"

export interface TimeSlot {
  time: string // HH:mm format
  available: boolean
  reason?: string
}

export async function getAvailableSlots(serviceId: string, professionalId: string, dateStr: string): Promise<string[]> {
  const date = new Date(dateStr)
  const dayOfWeek = date.getDay()

  // Get service to check duration and organization
  const service = await db.service.findUnique({
    where: { id: serviceId },
  })

  if (!service) {
    return []
  }

  // Check if professional can perform this service
  const serviceProfessional = await db.serviceProfessional.findFirst({
    where: {
      serviceId,
      professionalId,
    },
  })

  if (!serviceProfessional) {
    return []
  }

  // Get schedule rules for this professional and day
  const scheduleRules = await db.scheduleRule.findMany({
    where: {
      professionalId,
      dayOfWeek,
      active: true,
    },
  })

  if (scheduleRules.length === 0) {
    return []
  }

  // Get existing bookings for this professional on this date
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const bookings = await db.booking.findMany({
    where: {
      professionalId,
      status: "confirmed",
      startTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  })

  // Get blocks for this professional on this date
  const blocks = await db.block.findMany({
    where: {
      professionalId,
      startTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  })

  // Generate available slots
  const availableSlots: string[] = []
  const now = new Date()

  for (const rule of scheduleRules) {
    const [startHour, startMinute] = rule.startTime.split(":").map(Number)
    const [endHour, endMinute] = rule.endTime.split(":").map(Number)

    let currentHour = startHour
    let currentMinute = startMinute

    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const slotTime = `${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`
      const slotDateTime = new Date(date)
      slotDateTime.setHours(currentHour, currentMinute, 0, 0)

      // Check if slot is in the past
      if (slotDateTime > now) {
        // Check if slot conflicts with bookings
        const hasBookingConflict = bookings.some((booking) => {
          const bookingStart = new Date(booking.startTime)
          const bookingEnd = new Date(booking.endTime)
          const slotEnd = new Date(slotDateTime.getTime() + service.duration * 60000)

          return slotDateTime < bookingEnd && slotEnd > bookingStart
        })

        // Check if slot conflicts with blocks
        const hasBlockConflict = blocks.some((block) => {
          const blockStart = new Date(block.startTime)
          const blockEnd = new Date(block.endTime)
          const slotEnd = new Date(slotDateTime.getTime() + service.duration * 60000)

          return slotDateTime < blockEnd && slotEnd > blockStart
        })

        if (!hasBookingConflict && !hasBlockConflict) {
          availableSlots.push(slotTime)
        }
      }

      // Increment by 15 minutes
      currentMinute += 15
      if (currentMinute >= 60) {
        currentMinute = 0
        currentHour += 1
      }
    }
  }

  return availableSlots
}

export async function getAvailableDates(professionalId: string, daysAhead = 30): Promise<string[]> {
  const dates: string[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get all schedule rules for this professional
  const scheduleRules = await db.scheduleRule.findMany({
    where: {
      professionalId,
      active: true,
    },
  })

  const activeDays = new Set(scheduleRules.map((rule) => rule.dayOfWeek))

  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const dayOfWeek = date.getDay()

    if (activeDays.has(dayOfWeek)) {
      dates.push(date.toISOString().split("T")[0])
    }
  }

  return dates
}
