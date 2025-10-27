import type { NextRequest } from "next/server"
import { authenticateApiKey, unauthorizedResponse } from "@/lib/api-auth"
import { db } from "@/lib/db"

/**
 * GET /api/v1/services
 * List all active services for the organization
 * Requires API key authentication
 */
export async function GET(request: NextRequest) {
  const auth = await authenticateApiKey(request)

  if (!auth.authorized) {
    return unauthorizedResponse(auth.error || "Unauthorized")
  }

  try {
    const services = await db.service.findMany({
      where: {
        organizationId: auth.organizationId,
        active: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        duration: true,
        price: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return Response.json({
      success: true,
      data: services,
    })
  } catch (error) {
    console.error("[v0] API error:", error)
    return Response.json(
      {
        success: false,
        error: "Failed to fetch services",
      },
      { status: 500 },
    )
  }
}
