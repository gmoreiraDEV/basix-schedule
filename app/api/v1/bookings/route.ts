import type { NextRequest } from "next/server";
import { authenticateApiKey, unauthorizedResponse } from "@/lib/api-auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const auth = await authenticateApiKey(request);

  if (!auth.authorized) {
    return unauthorizedResponse(auth.error || "Unauthorized");
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {
      organizationId: auth.organizationId,
    };

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        where.startTime.gte = new Date(startDate);
      }
      if (endDate) {
        where.startTime.lte = new Date(endDate);
      }
    }

    const bookings = await db.booking.findMany({
      where,
      include: {
        service: {
          select: {
            name: true,
            duration: true,
          },
        },
        professional: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return Response.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("[v0] API error:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch bookings",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/bookings
 * Create a new booking
 * Requires API key authentication
 */
export async function POST(request: NextRequest) {
  const auth = await authenticateApiKey(request);

  if (!auth.authorized) {
    return unauthorizedResponse(auth.error || "Unauthorized");
  }

  try {
    const body = await request.json();
    const {
      serviceId,
      professionalId,
      clientName,
      clientEmail,
      clientPhone,
      startTime,
      notes,
    } = body;

    // Validate required fields
    if (!serviceId || !professionalId || !clientName || !startTime) {
      return Response.json(
        {
          success: false,
          error:
            "Missing required fields: serviceId, professionalId, clientName, startTime",
        },
        { status: 400 }
      );
    }

    // Get service to calculate end time
    const service = await db.service.findUnique({
      where: { id: serviceId },
    });

    if (!service || service.organizationId !== auth.organizationId) {
      return Response.json(
        {
          success: false,
          error: "Service not found",
        },
        { status: 404 }
      );
    }

    // Verify professional belongs to organization
    const professional = await db.professional.findUnique({
      where: { id: professionalId },
    });

    if (!professional || professional.organizationId !== auth.organizationId) {
      return Response.json(
        {
          success: false,
          error: "Professional not found",
        },
        { status: 404 }
      );
    }

    const startDateTime = new Date(startTime);
    const endDateTime = new Date(
      startDateTime.getTime() + service.duration * 60000
    );

    // Create booking
    const booking = await db.booking.create({
      data: {
        serviceId,
        professionalId,
        organizationId: auth.organizationId!,
        clientName,
        clientEmail,
        clientPhone,
        startTime: startDateTime,
        endTime: endDateTime,
        notes,
        status: "confirmed",
      },
      include: {
        service: {
          select: {
            name: true,
            duration: true,
          },
        },
        professional: {
          select: {
            name: true,
          },
        },
      },
    });

    return Response.json(
      {
        success: true,
        data: booking,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[v0] API error:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to create booking",
      },
      { status: 500 }
    );
  }
}
