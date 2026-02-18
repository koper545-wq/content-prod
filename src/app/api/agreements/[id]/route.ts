import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isDemoUser, getDemoAgreement } from "@/lib/demo-data";
import { generateAgreementHtml } from "@/lib/agreement-template";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (isDemoUser(session)) {
    const agreement = getDemoAgreement(id);
    if (!agreement) {
      return NextResponse.json({ error: "Nie znaleziono umowy" }, { status: 404 });
    }
    const html = generateAgreementHtml(agreement);
    return NextResponse.json({ agreement, html });
  }

  const agreement = await prisma.agreement.findUnique({
    where: { id },
    include: { booking: true },
  });

  if (!agreement) {
    return NextResponse.json({ error: "Nie znaleziono umowy" }, { status: 404 });
  }

  // Verify user is either the creator or the restaurant owner
  const isCreator = agreement.booking.creatorUserId === session.id;
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: agreement.booking.restaurantId },
    select: { ownerUserId: true },
  });
  const isRestaurantOwner = restaurant?.ownerUserId === session.id;

  if (!isCreator && !isRestaurantOwner) {
    return NextResponse.json({ error: "Brak dostępu" }, { status: 403 });
  }

  const html = generateAgreementHtml(agreement);
  return NextResponse.json({ agreement, html });
}
