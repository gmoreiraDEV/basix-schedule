import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const service = await prisma.service.findUnique({
      where: { organizationId: user.organizationId, id: params.id },
    });
    return NextResponse.json(service);
  } catch (error) {
    console.error("[v0] Error fetching service:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const service = await prisma.service.update({
      where: { organizationId: user.organizationId, id: params.id },
      data: {
        name: body.name,
        description: body.description,
        duration: body.duration,
        price: body.price,
        active: body.active,
      },
    });
    return NextResponse.json(service);
  } catch (error) {
    console.error("[v0] Error updating service:", error);
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
  }
}
