import type { NextRequest } from "next/server"
import { db } from "@/lib/db"

export interface ApiAuthResult {
  authorized: boolean
  organizationId?: string
  error?: string
}

/**
 * Authenticate API requests using API key
 * Expects header: Authorization: Bearer bsk_xxxxx
 */
export async function authenticateApiKey(request: NextRequest): Promise<ApiAuthResult> {
  const authHeader = request.headers.get("authorization")

  if (!authHeader) {
    return {
      authorized: false,
      error: "Missing Authorization header",
    }
  }

  if (!authHeader.startsWith("Bearer ")) {
    return {
      authorized: false,
      error: "Invalid Authorization header format. Expected: Bearer <api_key>",
    }
  }

  const apiKey = authHeader.substring(7) // Remove "Bearer "

  if (!apiKey.startsWith("bsk_")) {
    return {
      authorized: false,
      error: "Invalid API key format",
    }
  }

  try {
    const keyRecord = await db.apiKey.findUnique({
      where: { key: apiKey },
      include: {
        organization: true,
      },
    })

    if (!keyRecord) {
      return {
        authorized: false,
        error: "Invalid API key",
      }
    }

    if (!keyRecord.active) {
      return {
        authorized: false,
        error: "API key is inactive",
      }
    }

    if (!keyRecord.organization.active) {
      return {
        authorized: false,
        error: "Organization is inactive",
      }
    }

    // Update last used timestamp
    await db.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsedAt: new Date() },
    })

    return {
      authorized: true,
      organizationId: keyRecord.organizationId,
    }
  } catch (error) {
    console.error("[v0] API key authentication error:", error)
    return {
      authorized: false,
      error: "Authentication failed",
    }
  }
}

/**
 * Helper to create unauthorized response
 */
export function unauthorizedResponse(message: string) {
  return Response.json(
    {
      error: message,
      documentation: "/api/docs",
    },
    { status: 401 },
  )
}
