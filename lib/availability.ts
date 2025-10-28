import { db } from "./db";

export interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

export async function getAvailableSlots(
  serviceId: string,
  professionalId: string,
  dateStr: string
): Promise<TimeSlot[]> {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();

  const service = await db.service.findUnique({ where: { id: serviceId } });
  if (!service) return [];

  const link = await db.serviceProfessional.findFirst({
    where: { serviceId, professionalId },
  });
  if (!link) return [];

  const scheduleRules = await db.scheduleRule.findMany({
    where: { professionalId, dayOfWeek, active: true },
  });
  if (scheduleRules.length === 0) return [];

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const bookings = await db.booking.findMany({
    where: {
      professionalId,
      status: "confirmed",
      startTime: { gte: startOfDay, lte: endOfDay },
    },
  });

  const blocks = await db.block.findMany({
    where: {
      professionalId,
      startTime: { gte: startOfDay, lte: endOfDay },
    },
  });

  const slots: TimeSlot[] = [];
  const now = new Date();

  for (const rule of scheduleRules) {
    const [startH, startM] = rule.startTime.split(":").map(Number);
    const [endH, endM] = rule.endTime.split(":").map(Number);
    let current = new Date(date);
    current.setHours(startH, startM, 0, 0);

    const end = new Date(date);
    end.setHours(endH, endM, 0, 0);

    while (current < end) {
      const slotTime = `${String(current.getHours()).padStart(2, "0")}:${String(
        current.getMinutes()
      ).padStart(2, "0")}`;
      const slotEnd = new Date(current.getTime() + service.duration * 60000);

      const hasConflict =
        bookings.some(
          (b) =>
            current < new Date(b.endTime) && slotEnd > new Date(b.startTime)
        ) ||
        blocks.some(
          (bl) =>
            current < new Date(bl.endTime) && slotEnd > new Date(bl.startTime)
        );

      if (current > now) {
        slots.push({
          time: slotTime,
          available: !hasConflict,
          reason: hasConflict ? "indisponível" : undefined,
        });
      }
      current = new Date(current.getTime() + service.duration * 60000);
    }
  }

  return slots;
}
export async function getAvailableDates(
  professionalId: string,
  daysAhead = 30
): Promise<string[]> {
  const dates: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all schedule rules for this professional
  const scheduleRules = await db.scheduleRule.findMany({
    where: {
      professionalId,
      active: true,
    },
  });

  const activeDays = new Set(scheduleRules.map((rule) => rule.dayOfWeek));

  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayOfWeek = date.getDay();

    if (activeDays.has(dayOfWeek)) {
      dates.push(date.toISOString().split("T")[0]);
    }
  }

  return dates;
}
