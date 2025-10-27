import type { NextRequest } from "next/server"
import { authenticateApiKey, unauthorizedResponse } from "@/lib/api-auth"
import { getAvailableSlots } from "@/lib/availability"

/**
 * GET /api/v1/availability
 * Get available time slots
 * Query params: serviceId, professionalId, date (YYYY-MM-DD)
 * Requires API key authentication
 */
export async function GET(request: NextRequest) {
  const auth = await authenticateApiKey(request)

  if (!auth.authorized) {
    return unauthorizedResponse(auth.error || "Unauthorized")
  }

  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get("serviceId")
    const professionalId = searchParams.get("professionalId")
    const date = searchParams.get("date")

    if (!serviceId || !professionalId || !date) {
      return Response.json(
        {
          success: false,
          error: "Missing required parameters: serviceId, professionalId, date",
        },
        { status: 400 },
      )
    }

    const slots = await getAvailableSlots(serviceId, professionalId, date)

    return Response.json({
      success: true,
      data: {
        date,
        slots,
      },
    })
  } catch (error) {
    console.error("[v0] API error:", error)
    return Response.json(
      {
        success: false,
        error: "Failed to fetch availability",
      },
      { status: 500 },
    )
  }
}
