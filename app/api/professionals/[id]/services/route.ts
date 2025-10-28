import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();

    const professionals = await prisma.professional.findMany({
      where: { organizationId: user.organizationId },
      include: {
        services: {
          select: {
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(professionals);
  } catch (error) {
    console.error("[v0] Error fetching professionals:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
