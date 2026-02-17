import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isDemoUser } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  action: z.enum(["approve", "reject"]),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: userId } = await params;

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
    }

    // Demo mode
    if (isDemoUser(session)) {
      return NextResponse.json({
        success: true,
        status: parsed.data.action === "approve" ? "ACTIVE" : "BANNED",
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "Użytkownik nie istnieje" }, { status: 404 });
    }

    const newStatus = parsed.data.action === "approve" ? "ACTIVE" : "BANNED";

    await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus },
    });

    return NextResponse.json({ success: true, status: newStatus });
  } catch {
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
