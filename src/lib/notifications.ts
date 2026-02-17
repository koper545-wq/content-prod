import { prisma } from "./prisma";
import type { NotificationType } from "@/generated/prisma";

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link,
    },
  });

  // In production, send email here
  if (process.env.NODE_ENV === "development") {
    console.log(`[NOTIFICATION] ${input.type} -> ${input.userId}: ${input.title}`);
  }

  return notification;
}

export async function notifyApplicationAccepted(creatorId: string, campaignTitle: string, campaignId: string) {
  return createNotification({
    userId: creatorId,
    type: "APPLICATION_ACCEPTED",
    title: "Zgłoszenie zaakceptowane!",
    body: `Twoje zgłoszenie do "${campaignTitle}" zostało zaakceptowane. Sprawdź szczegóły wizyty.`,
    link: `/creator/moje`,
  });
}

export async function notifyConfirmVisit(creatorId: string, campaignTitle: string, confirmBy: string) {
  return createNotification({
    userId: creatorId,
    type: "CONFIRM_VISIT",
    title: "Potwierdź wizytę",
    body: `Potwierdź wizytę "${campaignTitle}" do ${confirmBy}.`,
    link: `/creator/moje`,
  });
}

export async function notifyContentDue(creatorId: string, campaignTitle: string, dueDate: Date | string, bookingId: string) {
  const dateStr = dueDate instanceof Date ? dueDate.toLocaleDateString("pl-PL") : dueDate;
  return createNotification({
    userId: creatorId,
    type: "CONTENT_DUE_REMINDER",
    title: "Przypomnienie o contencie",
    body: `Termin oddania contentu dla "${campaignTitle}" mija ${dateStr}.`,
    link: `/creator/booking/${bookingId}`,
  });
}

export async function notifyContentSubmitted(restaurantOwnerId: string, creatorName: string, campaignTitle: string, bookingId: string) {
  return createNotification({
    userId: restaurantOwnerId,
    type: "CONTENT_SUBMITTED",
    title: "Nowy content do weryfikacji",
    body: `${creatorName} oddał content dla "${campaignTitle}".`,
    link: `/restaurant/bookings/${bookingId}`,
  });
}

export async function notifyNewApplication(restaurantOwnerId: string, campaignTitle: string, campaignId: string) {
  return createNotification({
    userId: restaurantOwnerId,
    type: "NEW_APPLICATION",
    title: "Nowe zgłoszenie",
    body: `Nowa aplikacja do "${campaignTitle}".`,
    link: `/restaurant/campaigns/${campaignId}`,
  });
}

export async function notifyCreatorConfirmed(restaurantOwnerId: string, creatorName: string, campaignTitle: string, bookingId: string) {
  return createNotification({
    userId: restaurantOwnerId,
    type: "CREATOR_CONFIRMED",
    title: "Wizyta potwierdzona",
    body: `${creatorName} potwierdził wizytę dla "${campaignTitle}".`,
    link: `/restaurant/bookings/${bookingId}`,
  });
}
