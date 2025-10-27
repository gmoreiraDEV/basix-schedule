import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const professionalId = searchParams.get("professionalId")

    if (!professionalId) {
      return NextResponse.json({ error: "Professional ID required" }, { status: 400 })
    }

    const blocks = await prisma.block.findMany({
      where: {
        professionalId,
        professional: {
          organizationId: user.organizationId,
        },
      },
    })

    return NextResponse.json(blocks)
  } catch (error) {
    console.error("[v0] Error fetching blocks:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const block = await prisma.block.create({
      data: {
        professionalId: body.professionalId,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        reason: body.reason,
      },
    })

    return NextResponse.json(block)
  } catch (error) {
    console.error("[v0] Error creating block:", error)
    return NextResponse.json({ error: "Failed to create block" }, { status: 500 })
  }
}
