import type { NextRequest } from "next/server"
import { authenticateApiKey, unauthorizedResponse } from "@/lib/api-auth"
import { db } from "@/lib/db"

/**
 * GET /api/v1/professionals
 * List all active professionals for the organization
 * Requires API key authentication
 */
export async function GET(request: NextRequest) {
  const auth = await authenticateApiKey(request)

  if (!auth.authorized) {
    return unauthorizedResponse(auth.error || "Unauthorized")
  }

  try {
    const professionals = await db.professional.findMany({
      where: {
        organizationId: auth.organizationId,
        active: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return Response.json({
      success: true,
      data: professionals,
    })
  } catch (error) {
    console.error("[v0] API error:", error)
    return Response.json(
      {
        success: false,
        error: "Failed to fetch professionals",
      },
      { status: 500 },
    )
  }
}
