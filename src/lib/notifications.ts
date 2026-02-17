import { prisma } from "./prisma";
import { sendEmail } from "./email";
import {
  applicationAcceptedTemplate,
  newApplicationTemplate,
  contentSubmittedTemplate,
} from "./email-templates";
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

  // Skip email for demo users
  if (input.userId.startsWith("demo-")) {
    return notification;
  }

  // Send email notification
  try {
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      select: { email: true },
    });

    if (user?.email) {
      await sendEmail({
        to: user.email,
        subject: input.title,
        html: `<p>${input.body}</p>`,
      });

      await prisma.notification.update({
        where: { id: notification.id },
        data: { emailSent: true },
      });
    }
  } catch (error) {
    console.error("[NOTIFICATION] Email send failed:", error);
    // Don't throw — notification is already saved in DB
  }

  return notification;
}

export async function notifyApplicationAccepted(creatorId: string, campaignTitle: string, campaignId: string) {
  const notification = await prisma.notification.create({
    data: {
      userId: creatorId,
      type: "APPLICATION_ACCEPTED",
      title: "Zgłoszenie zaakceptowane!",
      body: `Twoje zgłoszenie do "${campaignTitle}" zostało zaakceptowane. Sprawdź szczegóły wizyty.`,
      link: `/creator/moje`,
    },
  });

  // Send rich email template
  if (!creatorId.startsWith("demo-")) {
    try {
      const user = await prisma.user.findUnique({ where: { id: creatorId }, select: { email: true } });
      if (user?.email) {
        const template = applicationAcceptedTemplate(campaignTitle);
        await sendEmail({ to: user.email, ...template });
        await prisma.notification.update({ where: { id: notification.id }, data: { emailSent: true } });
      }
    } catch (error) {
      console.error("[NOTIFICATION] Email failed:", error);
    }
  }

  return notification;
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
  const notification = await prisma.notification.create({
    data: {
      userId: restaurantOwnerId,
      type: "CONTENT_SUBMITTED",
      title: "Nowy content do weryfikacji",
      body: `${creatorName} oddał content dla "${campaignTitle}".`,
      link: `/restaurant/bookings/${bookingId}`,
    },
  });

  if (!restaurantOwnerId.startsWith("demo-")) {
    try {
      const user = await prisma.user.findUnique({ where: { id: restaurantOwnerId }, select: { email: true } });
      if (user?.email) {
        const template = contentSubmittedTemplate(campaignTitle, creatorName);
        await sendEmail({ to: user.email, ...template });
        await prisma.notification.update({ where: { id: notification.id }, data: { emailSent: true } });
      }
    } catch (error) {
      console.error("[NOTIFICATION] Email failed:", error);
    }
  }

  return notification;
}

export async function notifyNewApplication(restaurantOwnerId: string, campaignTitle: string, campaignId: string) {
  const notification = await prisma.notification.create({
    data: {
      userId: restaurantOwnerId,
      type: "NEW_APPLICATION",
      title: "Nowe zgłoszenie",
      body: `Nowa aplikacja do "${campaignTitle}".`,
      link: `/restaurant/campaigns/${campaignId}`,
    },
  });

  if (!restaurantOwnerId.startsWith("demo-")) {
    try {
      const user = await prisma.user.findUnique({ where: { id: restaurantOwnerId }, select: { email: true } });
      if (user?.email) {
        // Need creator name for template — fetch from last application
        const template = newApplicationTemplate(campaignTitle, "Nowy twórca");
        await sendEmail({ to: user.email, ...template });
        await prisma.notification.update({ where: { id: notification.id }, data: { emailSent: true } });
      }
    } catch (error) {
      console.error("[NOTIFICATION] Email failed:", error);
    }
  }

  return notification;
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
