import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isDemoUser } from "@/lib/demo-data";
import { z } from "zod";
import { addDays } from "date-fns";

const schema = z.object({
  action: z.enum(["ban", "suspend", "activate"]),
  days: z.number().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isDemoUser(session)) {
    return NextResponse.json({ ok: true });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  switch (parsed.data.action) {
    case "ban":
      await prisma.user.update({
        where: { id },
        data: { status: "BANNED", suspendedUntil: null },
      });
      break;
    case "suspend":
      await prisma.user.update({
        where: { id },
        data: {
          status: "SUSPENDED",
          suspendedUntil: addDays(new Date(), parsed.data.days || 14),
        },
      });
      break;
    case "activate":
      await prisma.user.update({
        where: { id },
        data: { status: "ACTIVE", suspendedUntil: null },
      });
      break;
  }

  return NextResponse.json({ ok: true });
}
