import { type NextRequest, NextResponse } from "next/server"
import { getAvailableSlots } from "@/lib/availability"
import { requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const searchParams = request.nextUrl.searchParams
    const professionalId = searchParams.get("professionalId")
    const serviceId = searchParams.get("serviceId")
    const dateStr = searchParams.get("date")

    if (!professionalId || !serviceId || !dateStr) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const slots = await getAvailableSlots(serviceId, professionalId, dateStr)

    return NextResponse.json({ slots })
  } catch (error) {
    console.error("[v0] Availability API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
