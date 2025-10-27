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

    const rules = await prisma.scheduleRule.findMany({
      where: {
        professionalId,
        professional: {
          organizationId: user.organizationId,
        },
      },
    })

    return NextResponse.json(rules)
  } catch (error) {
    console.error("[v0] Error fetching schedule rules:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const rule = await prisma.scheduleRule.create({
      data: {
        professionalId: body.professionalId,
        dayOfWeek: body.dayOfWeek,
        startTime: body.startTime,
        endTime: body.endTime,
        active: body.active,
      },
    })

    return NextResponse.json(rule)
  } catch (error) {
    console.error("[v0] Error creating schedule rule:", error)
    return NextResponse.json({ error: "Failed to create schedule rule" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const rule = await prisma.scheduleRule.update({
      where: {
        professionalId_dayOfWeek: {
          professionalId: body.professionalId,
          dayOfWeek: body.dayOfWeek,
        },
      },
      data: {
        active: body.active,
      },
    })

    return NextResponse.json(rule)
  } catch (error) {
    console.error("[v0] Error updating schedule rule:", error)
    return NextResponse.json({ error: "Failed to update schedule rule" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const professionalId = searchParams.get("professionalId")
    const dayOfWeek = searchParams.get("dayOfWeek")

    if (!professionalId || !dayOfWeek) {
      return NextResponse.json({ error: "Professional ID and day of week required" }, { status: 400 })
    }

    await prisma.scheduleRule.delete({
      where: {
        professionalId_dayOfWeek: {
          professionalId,
          dayOfWeek: Number.parseInt(dayOfWeek),
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting schedule rule:", error)
    return NextResponse.json({ error: "Failed to delete schedule rule" }, { status: 500 })
  }
}
