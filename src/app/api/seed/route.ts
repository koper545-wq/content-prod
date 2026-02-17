import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { addDays, addHours } from "date-fns";

const DEMO_PASSWORD = "demo1234";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    // Check if demo data already exists
    const existing = await prisma.user.findUnique({
      where: { email: "creator@demo.pl" },
    });
    if (existing) {
      return NextResponse.json({ message: "Demo data already seeded", fresh: false });
    }

    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

    // --- Create users ---
    const creator = await prisma.user.create({
      data: {
        email: "creator@demo.pl",
        nameDisplay: "Anna Kowalska",
        role: "CREATOR",
        passwordHash,
        status: "ACTIVE",
      },
    });

    const creator2 = await prisma.user.create({
      data: {
        email: "creator2@demo.pl",
        nameDisplay: "Marek Nowak",
        role: "CREATOR",
        passwordHash,
        status: "ACTIVE",
      },
    });

    const restaurantOwner = await prisma.user.create({
      data: {
        email: "restauracja@demo.pl",
        nameDisplay: "Jan Restaurator",
        role: "RESTAURANT_OWNER",
        passwordHash,
        status: "ACTIVE",
      },
    });

    const admin = await prisma.user.create({
      data: {
        email: "admin@demo.pl",
        nameDisplay: "Admin CONTENT",
        role: "ADMIN",
        passwordHash,
        status: "ACTIVE",
      },
    });

    // --- Creator profiles ---
    await prisma.creatorProfile.create({
      data: {
        userId: creator.id,
        city: "Warszawa",
        instagramUrl: "https://instagram.com/anna_foodie",
        tiktokUrl: "https://tiktok.com/@anna_foodie",
        followerRange: "FROM_10K_TO_30K",
        niches: ["food", "lifestyle"],
        languages: ["pl", "en"],
      },
    });

    await prisma.creatorProfile.create({
      data: {
        userId: creator2.id,
        city: "Kraków",
        instagramUrl: "https://instagram.com/marek_eats",
        followerRange: "FROM_2K_TO_10K",
        niches: ["food", "travel"],
        languages: ["pl"],
      },
    });

    // --- Restaurant ---
    const restaurant = await prisma.restaurant.create({
      data: {
        ownerUserId: restaurantOwner.id,
        name: "Trattoria Bella",
        addressLine: "ul. Marszałkowska 42",
        city: "Warszawa",
        instagramUrl: "https://instagram.com/trattoria_bella",
        websiteUrl: "https://trattoriabella.pl",
        phone: "+48 22 123 4567",
        status: "ACTIVE",
      },
    });

    const restaurant2 = await prisma.restaurant.create({
      data: {
        ownerUserId: restaurantOwner.id,
        name: "Sushi Zen",
        addressLine: "ul. Nowy Świat 18",
        city: "Warszawa",
        instagramUrl: "https://instagram.com/sushi_zen_waw",
        status: "ACTIVE",
      },
    });

    // --- Campaigns ---
    const now = new Date();

    const campaign1 = await prisma.campaign.create({
      data: {
        restaurantId: restaurant.id,
        title: "Letnie menu — reels & stories",
        descriptionShort: "Promuj nasze nowe letnie menu! Szukamy twórców z Warszawy na reels i stories.",
        descriptionDetails:
          "Oferujemy degustację 3 dań z nowego letniego menu + napój. Szukamy twórców, którzy stworzą min. 1 reel i 3 stories z oznaczeniem naszego profilu. Wizyta trwa ok. 1.5h.",
        offerValueDesc: "Degustacja 3 dań + napój (wartość ok. 120 zł)",
        deliverablesJson: [
          { type: "IG_REEL", quantity: 1, description: "Reel min. 30s z jedzeniem" },
          { type: "IG_STORY", quantity: 3, description: "Stories z oznaczeniem @trattoria_bella" },
        ],
        requirementsJson: {
          minFollowers: "FROM_2K_TO_10K",
          cities: ["Warszawa"],
          niches: ["food"],
        },
        contentDeadlineDays: 7,
        confirmationRequiredHours: 24,
        cancellationPolicy: "FLEX",
        status: "ACTIVE",
      },
    });

    const campaign2 = await prisma.campaign.create({
      data: {
        restaurantId: restaurant2.id,
        title: "Sushi experience — TikTok",
        descriptionShort: "Nagraj TikToka z naszego sushi baru! All-you-can-eat w zamian za content.",
        descriptionDetails:
          "All-you-can-eat sushi dla 1 osoby. Szukamy twórcy na TikToka — format dowolny (mukbang, review, vlog). Min. 1 TikTok 60s+.",
        offerValueDesc: "All-you-can-eat sushi (wartość ok. 89 zł)",
        deliverablesJson: [
          { type: "TIKTOK", quantity: 1, description: "TikTok min. 60s" },
        ],
        requirementsJson: {
          minFollowers: "UNDER_2K",
          cities: ["Warszawa"],
        },
        contentDeadlineDays: 5,
        confirmationRequiredHours: 12,
        cancellationPolicy: "STRICT",
        status: "ACTIVE",
      },
    });

    const campaignDraft = await prisma.campaign.create({
      data: {
        restaurantId: restaurant.id,
        title: "Walentynkowa kolacja [DRAFT]",
        descriptionShort: "Kolacja walentynkowa dla pary w zamian za content.",
        offerValueDesc: "Kolacja dla 2 osób (wartość ok. 250 zł)",
        deliverablesJson: [
          { type: "IG_REEL", quantity: 1, description: "Reel z kolacji" },
          { type: "IG_STORY", quantity: 5, description: "Stories z wieczoru" },
        ],
        contentDeadlineDays: 7,
        status: "DRAFT",
      },
    });

    // --- Slots ---
    const slot1 = await prisma.slot.create({
      data: {
        campaignId: campaign1.id,
        startAt: addDays(now, 3),
        endAt: addHours(addDays(now, 3), 2),
        capacity: 2,
        bookedCount: 1,
        status: "OPEN",
      },
    });

    const slot2 = await prisma.slot.create({
      data: {
        campaignId: campaign1.id,
        startAt: addDays(now, 5),
        endAt: addHours(addDays(now, 5), 2),
        capacity: 1,
        bookedCount: 0,
        status: "OPEN",
      },
    });

    const slot3 = await prisma.slot.create({
      data: {
        campaignId: campaign2.id,
        startAt: addDays(now, 2),
        endAt: addHours(addDays(now, 2), 3),
        capacity: 1,
        bookedCount: 1,
        status: "FULL",
      },
    });

    const slot4 = await prisma.slot.create({
      data: {
        campaignId: campaign2.id,
        startAt: addDays(now, 7),
        endAt: addHours(addDays(now, 7), 3),
        capacity: 2,
        bookedCount: 0,
        status: "OPEN",
      },
    });

    // --- Applications ---
    // Creator 1 applied to campaign 1 — accepted
    await prisma.application.create({
      data: {
        campaignId: campaign1.id,
        creatorUserId: creator.id,
        message: "Cześć! Uwielbiam włoską kuchnię i chętnie stworzę content z Waszego letniego menu. Mam doświadczenie w food photography.",
        preferredSlotIds: [slot1.id, slot2.id],
        status: "ACCEPTED",
      },
    });

    // Creator 2 applied to campaign 1 — pending
    await prisma.application.create({
      data: {
        campaignId: campaign1.id,
        creatorUserId: creator2.id,
        message: "Hej! Jestem z Krakowa ale będę w Warszawie w przyszłym tygodniu. Mogę zrobić super reels!",
        preferredSlotIds: [slot2.id],
        status: "APPLIED",
      },
    });

    // Creator 1 applied to campaign 2 — accepted
    await prisma.application.create({
      data: {
        campaignId: campaign2.id,
        creatorUserId: creator.id,
        message: "Sushi to moje ulubione! TikTok z mukbangiem będzie super 🍣",
        preferredSlotIds: [slot3.id],
        status: "ACCEPTED",
      },
    });

    // --- Bookings ---
    // Booking 1: Creator at campaign 1, confirmed, content pending
    const booking1 = await prisma.booking.create({
      data: {
        campaignId: campaign1.id,
        restaurantId: restaurant.id,
        creatorUserId: creator.id,
        slotId: slot1.id,
        status: "VISITED",
        confirmBy: addDays(now, -1),
        contentDueAt: addDays(now, 4),
        checkinNote: "Twórca przyszedł na czas, bardzo profesjonalny.",
      },
    });

    // Booking 2: Creator at campaign 2, booked, needs confirmation
    await prisma.booking.create({
      data: {
        campaignId: campaign2.id,
        restaurantId: restaurant2.id,
        creatorUserId: creator.id,
        slotId: slot3.id,
        status: "CONFIRMATION_PENDING",
        confirmBy: addHours(now, 12),
      },
    });

    // --- Content submission for booking 1 ---
    await prisma.contentSubmission.create({
      data: {
        bookingId: booking1.id,
        linksJson: [
          { type: "IG_REEL", url: "https://instagram.com/reel/demo123", description: "Reel z degustacji letniego menu" },
          { type: "IG_STORY", url: "https://instagram.com/stories/demo456", description: "Stories 1/3" },
        ],
        status: "SUBMITTED",
      },
    });

    // --- Notifications ---
    await prisma.notification.createMany({
      data: [
        {
          userId: creator.id,
          type: "APPLICATION_ACCEPTED",
          title: "Aplikacja zaakceptowana!",
          body: "Twoja aplikacja na kampanię \"Letnie menu — reels & stories\" została zaakceptowana. Potwierdź swoją wizytę.",
          link: `/creator/booking/${booking1.id}`,
          read: true,
        },
        {
          userId: creator.id,
          type: "CONFIRM_VISIT",
          title: "Potwierdź wizytę",
          body: "Masz oczekującą wizytę w Sushi Zen. Potwierdź do 12h.",
          link: `/creator/moje`,
          read: false,
        },
        {
          userId: restaurantOwner.id,
          type: "NEW_APPLICATION",
          title: "Nowa aplikacja",
          body: "Marek Nowak aplikował na kampanię \"Letnie menu — reels & stories\".",
          link: `/restaurant/applications`,
          read: false,
        },
        {
          userId: restaurantOwner.id,
          type: "CONTENT_SUBMITTED",
          title: "Content dostarczony",
          body: "Anna Kowalska przesłała content do kampanii \"Letnie menu\". Sprawdź i zatwierdź.",
          link: `/restaurant/bookings/${booking1.id}`,
          read: false,
        },
        {
          userId: admin.id,
          type: "NEW_APPLICATION",
          title: "Platforma rośnie!",
          body: "Nowi użytkownicy zarejestrowali się na platformie. Sprawdź statystyki.",
          link: `/admin/dashboard`,
          read: false,
        },
      ],
    });

    return NextResponse.json({
      message: "Demo data seeded successfully",
      fresh: true,
      accounts: {
        creator: { email: "creator@demo.pl", password: DEMO_PASSWORD, role: "CREATOR" },
        restaurant: { email: "restauracja@demo.pl", password: DEMO_PASSWORD, role: "RESTAURANT_OWNER" },
        admin: { email: "admin@demo.pl", password: DEMO_PASSWORD, role: "ADMIN" },
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed demo data", details: String(error) },
      { status: 500 }
    );
  }
}
