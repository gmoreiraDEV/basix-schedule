import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function GET() {
  try {
    const user = await requireAuth()

    const bookings = await db.booking.findMany({
      where: {
        organizationId: user.organizationId,
      },
      include: {
        service: {
          select: {
            name: true,
            duration: true,
          },
        },
        professional: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error("[v0] Bookings API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const { serviceId, professionalId, clientName, clientEmail, clientPhone, startTime, notes } = body

    // Get service to calculate end time and verify organization
    const service = await db.service.findUnique({
      where: { id: serviceId },
    })

    if (!service || service.organizationId !== user.organizationId) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Verify professional belongs to organization
    const professional = await db.professional.findUnique({
      where: { id: professionalId },
    })

    if (!professional || professional.organizationId !== user.organizationId) {
      return NextResponse.json({ error: "Professional not found" }, { status: 404 })
    }

    const startDateTime = new Date(startTime)
    const endDateTime = new Date(startDateTime.getTime() + service.duration * 60000)

    const booking = await db.booking.create({
      data: {
        serviceId,
        professionalId,
        organizationId: user.organizationId,
        clientName,
        clientEmail,
        clientPhone,
        startTime: startDateTime,
        endTime: endDateTime,
        notes,
        status: "confirmed",
      },
      include: {
        service: {
          select: {
            name: true,
            duration: true,
          },
        },
        professional: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    console.error("[v0] Create booking error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
