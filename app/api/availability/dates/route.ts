import { type NextRequest, NextResponse } from "next/server"
import { getAvailableDates } from "@/lib/availability"
import { requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const searchParams = request.nextUrl.searchParams
    const professionalId = searchParams.get("professionalId")
    const daysAhead = searchParams.get("daysAhead")

    if (!professionalId) {
      return NextResponse.json({ error: "Missing professionalId parameter" }, { status: 400 })
    }

    const dates = await getAvailableDates(professionalId, daysAhead ? Number.parseInt(daysAhead) : 30)

    return NextResponse.json({ dates })
  } catch (error) {
    console.error("[v0] Availability dates API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
