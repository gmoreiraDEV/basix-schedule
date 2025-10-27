import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth()
    const { id } = await params

    // Verify professional belongs to user's organization
    const professional = await db.professional.findUnique({
      where: { id },
    })

    if (!professional || professional.organizationId !== user.organizationId) {
      return NextResponse.json({ error: "Professional not found" }, { status: 404 })
    }

    // Get services for this professional
    const serviceProfessionals = await db.serviceProfessional.findMany({
      where: { professionalId: id },
      include: {
        service: {
          where: {
            active: true,
            organizationId: user.organizationId,
          },
        },
      },
    })

    const services = serviceProfessionals.map((sp) => sp.service)

    return NextResponse.json({ services })
  } catch (error) {
    console.error("[v0] Professional services API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
