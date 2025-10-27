import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const user = await requireAuth()
    const now = new Date()

    const bookings = await prisma.booking.findMany({
      where: { organizationId: user.organizationId },
    })

    const stats = {
      total: bookings.length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
      upcoming: bookings.filter((b) => new Date(b.startTime) > now && b.status === "confirmed").length,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("[v0] Error fetching booking stats:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
