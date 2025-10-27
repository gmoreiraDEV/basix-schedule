import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bookings = await prisma.booking.findMany({
      where: { organizationId: user.organizationId },
      include: {
        service: true,
        professional: true,
      },
      orderBy: { startTime: "asc" },
    })

    const services = await prisma.service.findMany({
      where: { organizationId: user.organizationId },
    })

    const professionals = await prisma.professional.findMany({
      where: { organizationId: user.organizationId },
    })

    // Calculate stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayBookings = bookings.filter((b) => {
      const bookingDate = new Date(b.startTime)
      return bookingDate >= today && bookingDate < tomorrow
    })

    const upcomingBookings = bookings.filter((b) => new Date(b.startTime) > new Date()).slice(0, 5)

    return NextResponse.json({
      stats: {
        todayBookings: todayBookings.length,
        totalBookings: bookings.length,
        activeServices: services.filter((s) => s.active).length,
        activeProfessionals: professionals.filter((p) => p.active).length,
      },
      upcomingBookings: upcomingBookings.map((booking) => ({
        id: booking.id,
        clientName: booking.clientName,
        startTime: booking.startTime,
        service: {
          name: booking.service.name,
        },
        professional: {
          name: booking.professional.name,
        },
      })),
    })
  } catch (error) {
    console.error("[v0] Dashboard stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
