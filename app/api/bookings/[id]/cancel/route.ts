import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth()
    const { id } = await params

    // Verify booking belongs to user's organization
    const booking = await db.booking.findUnique({
      where: { id },
    })

    if (!booking || booking.organizationId !== user.organizationId) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Update booking status to cancelled
    const updatedBooking = await db.booking.update({
      where: { id },
      data: { status: "cancelled" },
    })

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully",
      booking: updatedBooking,
    })
  } catch (error) {
    console.error("[v0] Cancel booking error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
