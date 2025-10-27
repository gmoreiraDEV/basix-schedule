import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const user = await requireAuth()

    const professionals = await prisma.professional.findMany({
      where: { organizationId: user.organizationId },
      include: {
        serviceProfessionals: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(
      professionals.map((p) => ({
        ...p,
        services: p.serviceProfessionals.map((sp) => sp.service),
      })),
    )
  } catch (error) {
    console.error("[v0] Error fetching professionals:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const professional = await prisma.professional.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        active: body.active,
        organizationId: user.organizationId,
      },
    })

    // Create service associations
    if (body.services && body.services.length > 0) {
      await prisma.serviceProfessional.createMany({
        data: body.services.map((serviceId: string) => ({
          serviceId,
          professionalId: professional.id,
        })),
      })
    }

    return NextResponse.json(professional)
  } catch (error) {
    console.error("[v0] Error creating professional:", error)
    return NextResponse.json({ error: "Failed to create professional" }, { status: 500 })
  }
}
