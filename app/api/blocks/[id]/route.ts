import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()

    await prisma.block.delete({
      where: {
        id: params.id,
        professional: {
          organizationId: user.organizationId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting block:", error)
    return NextResponse.json({ error: "Failed to delete block" }, { status: 500 })
  }
}
