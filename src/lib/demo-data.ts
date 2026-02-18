import type { SessionUser } from "./session";
import { addDays, addHours } from "date-fns";

export function isDemoUser(session: SessionUser | null): boolean {
  return session?.id?.startsWith("demo-") ?? false;
}

const now = new Date();

const RESTAURANTS = [
  {
    id: "demo-rest-001",
    ownerUserId: "demo-restaurant-001",
    name: "Trattoria Bella",
    addressLine: "ul. Marszałkowska 42",
    city: "Warszawa",
    companyName: "Trattoria Bella Sp. z o.o.",
    nip: "5213456789",
    companyAddress: "ul. Marszałkowska 42, 00-001 Warszawa",
    instagramUrl: "https://instagram.com/trattoria_bella",
    websiteUrl: "https://trattoriabella.pl",
    phone: "+48 22 123 4567",
    status: "ACTIVE",
    createdAt: addDays(now, -30).toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "demo-rest-002",
    ownerUserId: "demo-restaurant-001",
    name: "Sushi Zen",
    addressLine: "ul. Nowy Świat 18",
    city: "Warszawa",
    companyName: "Sushi Zen S.C. Tanaka & Kowalski",
    nip: "5219876543",
    companyAddress: "ul. Nowy Świat 18, 00-001 Warszawa",
    instagramUrl: "https://instagram.com/sushi_zen_waw",
    websiteUrl: null,
    phone: null,
    status: "ACTIVE",
    createdAt: addDays(now, -20).toISOString(),
    updatedAt: now.toISOString(),
  },
];

const SLOTS = [
  { id: "demo-slot-001", campaignId: "demo-camp-001", startAt: addDays(now, 3).toISOString(), endAt: addHours(addDays(now, 3), 2).toISOString(), capacity: 2, bookedCount: 1, status: "OPEN" },
  { id: "demo-slot-002", campaignId: "demo-camp-001", startAt: addDays(now, 5).toISOString(), endAt: addHours(addDays(now, 5), 2).toISOString(), capacity: 1, bookedCount: 0, status: "OPEN" },
  { id: "demo-slot-003", campaignId: "demo-camp-002", startAt: addDays(now, 2).toISOString(), endAt: addHours(addDays(now, 2), 3).toISOString(), capacity: 1, bookedCount: 1, status: "FULL" },
  { id: "demo-slot-004", campaignId: "demo-camp-002", startAt: addDays(now, 7).toISOString(), endAt: addHours(addDays(now, 7), 3).toISOString(), capacity: 2, bookedCount: 0, status: "OPEN" },
  { id: "demo-slot-005", campaignId: "demo-camp-001", startAt: addDays(now, 8).toISOString(), endAt: addHours(addDays(now, 8), 2).toISOString(), capacity: 2, bookedCount: 1, status: "OPEN" },
  { id: "demo-slot-006", campaignId: "demo-camp-001", startAt: addDays(now, 12).toISOString(), endAt: addHours(addDays(now, 12), 2).toISOString(), capacity: 1, bookedCount: 0, status: "OPEN" },
  { id: "demo-slot-007", campaignId: "demo-camp-002", startAt: addDays(now, 10).toISOString(), endAt: addHours(addDays(now, 10), 2).toISOString(), capacity: 2, bookedCount: 0, status: "OPEN" },
  { id: "demo-slot-008", campaignId: "demo-camp-001", startAt: addDays(now, 15).toISOString(), endAt: addHours(addDays(now, 15), 1.5).toISOString(), capacity: 1, bookedCount: 0, status: "OPEN" },
];

const CAMPAIGNS = [
  {
    id: "demo-camp-001",
    restaurantId: "demo-rest-001",
    title: "Letnie menu — reels & stories",
    descriptionShort: "Promuj nasze nowe letnie menu! Szukamy twórców z Warszawy na reels i stories.",
    descriptionDetails: "Oferujemy degustację 3 dań z nowego letniego menu + napój. Szukamy twórców, którzy stworzą min. 1 reel i 3 stories z oznaczeniem naszego profilu. Wizyta trwa ok. 1.5h.",
    offerValueDesc: "Degustacja 3 dań + napój (wartość ok. 120 zł)",
    deliverablesJson: [
      { type: "IG_REEL", quantity: 1, description: "Reel min. 30s z jedzeniem" },
      { type: "IG_STORY", quantity: 3, description: "Stories z oznaczeniem @trattoria_bella" },
    ],
    requirementsJson: { minFollowers: "FROM_2K_TO_10K", cities: ["Warszawa"], niches: ["food"] },
    contentDeadlineDays: 7,
    confirmationRequiredHours: 24,
    cancellationPolicy: "FLEX",
    status: "ACTIVE",
    createdAt: addDays(now, -5).toISOString(),
    updatedAt: addDays(now, -5).toISOString(),
    restaurant: { id: "demo-rest-001", name: "Trattoria Bella", city: "Warszawa", instagramUrl: "https://instagram.com/trattoria_bella" },
    slots: SLOTS.filter((s) => s.campaignId === "demo-camp-001"),
    _count: { applications: 2, bookings: 2, slots: 5 },
  },
  {
    id: "demo-camp-002",
    restaurantId: "demo-rest-002",
    title: "Sushi experience — TikTok",
    descriptionShort: "Nagraj TikToka z naszego sushi baru! All-you-can-eat w zamian za content.",
    descriptionDetails: "All-you-can-eat sushi dla 1 osoby. Szukamy twórcy na TikToka — format dowolny (mukbang, review, vlog). Min. 1 TikTok 60s+.",
    offerValueDesc: "All-you-can-eat sushi (wartość ok. 89 zł)",
    deliverablesJson: [{ type: "TIKTOK", quantity: 1, description: "TikTok min. 60s" }],
    requirementsJson: { minFollowers: "UNDER_2K", cities: ["Warszawa"] },
    contentDeadlineDays: 5,
    confirmationRequiredHours: 12,
    cancellationPolicy: "STRICT",
    status: "ACTIVE",
    createdAt: addDays(now, -3).toISOString(),
    updatedAt: addDays(now, -3).toISOString(),
    restaurant: { id: "demo-rest-002", name: "Sushi Zen", city: "Warszawa", instagramUrl: "https://instagram.com/sushi_zen_waw" },
    slots: SLOTS.filter((s) => s.campaignId === "demo-camp-002"),
    _count: { applications: 1, bookings: 1, slots: 3 },
  },
  {
    id: "demo-camp-003",
    restaurantId: "demo-rest-001",
    title: "Walentynkowa kolacja [DRAFT]",
    descriptionShort: "Kolacja walentynkowa dla pary w zamian za content.",
    descriptionDetails: null,
    offerValueDesc: "Kolacja dla 2 osób (wartość ok. 250 zł)",
    deliverablesJson: [
      { type: "IG_REEL", quantity: 1, description: "Reel z kolacji" },
      { type: "IG_STORY", quantity: 5, description: "Stories z wieczoru" },
    ],
    requirementsJson: null,
    contentDeadlineDays: 7,
    confirmationRequiredHours: 24,
    cancellationPolicy: "FLEX",
    status: "DRAFT",
    createdAt: addDays(now, -1).toISOString(),
    updatedAt: addDays(now, -1).toISOString(),
    restaurant: { id: "demo-rest-001", name: "Trattoria Bella", city: "Warszawa", instagramUrl: "https://instagram.com/trattoria_bella" },
    slots: [],
    _count: { applications: 0, bookings: 0, slots: 0 },
  },
];

const BOOKINGS = [
  {
    id: "demo-booking-001",
    campaignId: "demo-camp-001",
    restaurantId: "demo-rest-001",
    creatorUserId: "demo-creator-001",
    slotId: "demo-slot-001",
    status: "VISITED",
    confirmBy: addDays(now, -1).toISOString(),
    contentDueAt: addDays(now, 4).toISOString(),
    checkinNote: "Twórca przyszedł na czas, bardzo profesjonalny.",
    createdAt: addDays(now, -4).toISOString(),
    updatedAt: addDays(now, -1).toISOString(),
    creator: {
      id: "demo-creator-001",
      nameDisplay: "Anna Kowalska",
      email: "creator@demo.pl",
      creatorProfile: { strikesCount: 0, followerRange: "FROM_10K_TO_30K", city: "Warszawa", instagramUrl: "https://instagram.com/anna_foodie" },
    },
    campaign: { id: "demo-camp-001", title: "Letnie menu — reels & stories", deliverablesJson: CAMPAIGNS[0].deliverablesJson, contentDeadlineDays: 7 },
    slot: SLOTS[0],
    contentSubmission: {
      id: "demo-cs-001",
      bookingId: "demo-booking-001",
      linksJson: [
        { type: "IG_REEL", url: "https://instagram.com/reel/demo123", description: "Reel z degustacji letniego menu", thumbnailUrl: "https://picsum.photos/seed/reel1/400/500" },
        { type: "IG_STORY", url: "https://instagram.com/stories/demo456", description: "Stories 1/3", thumbnailUrl: "https://picsum.photos/seed/story1/400/700" },
      ],
      submittedAt: addDays(now, -1).toISOString(),
      restaurantApprovedAt: addDays(now, -1).toISOString(),
      status: "APPROVED",
    },
    agreement: { id: "demo-agreement-001", status: "SIGNED" },
  },
  {
    id: "demo-booking-002",
    campaignId: "demo-camp-002",
    restaurantId: "demo-rest-002",
    creatorUserId: "demo-creator-001",
    slotId: "demo-slot-003",
    status: "CONFIRMATION_PENDING",
    confirmBy: addHours(now, 12).toISOString(),
    contentDueAt: null,
    checkinNote: null,
    createdAt: addDays(now, -1).toISOString(),
    updatedAt: now.toISOString(),
    creator: {
      id: "demo-creator-001",
      nameDisplay: "Anna Kowalska",
      email: "creator@demo.pl",
      creatorProfile: { strikesCount: 0, followerRange: "FROM_10K_TO_30K", city: "Warszawa", instagramUrl: "https://instagram.com/anna_foodie" },
    },
    campaign: { id: "demo-camp-002", title: "Sushi experience — TikTok", deliverablesJson: CAMPAIGNS[1].deliverablesJson, contentDeadlineDays: 5 },
    slot: SLOTS[2],
    contentSubmission: null,
    agreement: { id: "demo-agreement-002", status: "PENDING_CREATOR" },
  },
  {
    id: "demo-booking-003",
    campaignId: "demo-camp-001",
    restaurantId: "demo-rest-001",
    creatorUserId: "demo-creator-001",
    slotId: "demo-slot-005",
    status: "CONFIRMED",
    confirmBy: addDays(now, 6).toISOString(),
    contentDueAt: null,
    checkinNote: null,
    createdAt: addDays(now, -1).toISOString(),
    updatedAt: now.toISOString(),
    creator: {
      id: "demo-creator-001",
      nameDisplay: "Anna Kowalska",
      email: "creator@demo.pl",
      creatorProfile: { strikesCount: 0, followerRange: "FROM_10K_TO_30K", city: "Warszawa", instagramUrl: "https://instagram.com/anna_foodie" },
    },
    campaign: { id: "demo-camp-001", title: "Letnie menu — reels & stories", deliverablesJson: CAMPAIGNS[0].deliverablesJson, contentDeadlineDays: 7 },
    slot: SLOTS[4],
    contentSubmission: null,
    agreement: { id: "demo-agreement-003", status: "SIGNED" },
  },
  {
    id: "demo-booking-004",
    campaignId: "demo-camp-002",
    restaurantId: "demo-rest-002",
    creatorUserId: "demo-creator-002",
    slotId: "demo-slot-004",
    status: "VISITED",
    confirmBy: addDays(now, 5).toISOString(),
    contentDueAt: addDays(now, 2).toISOString(),
    checkinNote: null,
    createdAt: addDays(now, -2).toISOString(),
    updatedAt: addDays(now, -1).toISOString(),
    creator: {
      id: "demo-creator-002",
      nameDisplay: "Marek Nowak",
      email: "creator2@demo.pl",
      creatorProfile: { strikesCount: 0, followerRange: "FROM_2K_TO_10K", city: "Kraków", instagramUrl: "https://instagram.com/marek_eats" },
    },
    campaign: { id: "demo-camp-002", title: "Sushi experience — TikTok", deliverablesJson: CAMPAIGNS[1].deliverablesJson, contentDeadlineDays: 5 },
    slot: SLOTS[3],
    contentSubmission: {
      id: "demo-cs-002",
      bookingId: "demo-booking-004",
      linksJson: [
        { type: "TIKTOK", url: "https://tiktok.com/@marek_eats/video/demo789", description: "Mukbang sushi all-you-can-eat", thumbnailUrl: "https://picsum.photos/seed/tiktok1/400/500" },
      ],
      submittedAt: addDays(now, -1).toISOString(),
      restaurantApprovedAt: addDays(now, -1).toISOString(),
      status: "APPROVED",
    },
    agreement: null,
  },
  {
    id: "demo-booking-005",
    campaignId: "demo-camp-001",
    restaurantId: "demo-rest-001",
    creatorUserId: "demo-creator-001",
    slotId: "demo-slot-006",
    status: "COMPLETED",
    confirmBy: addDays(now, -10).toISOString(),
    contentDueAt: addDays(now, -5).toISOString(),
    checkinNote: "Świetna współpraca!",
    createdAt: addDays(now, -14).toISOString(),
    updatedAt: addDays(now, -5).toISOString(),
    creator: {
      id: "demo-creator-001",
      nameDisplay: "Anna Kowalska",
      email: "creator@demo.pl",
      creatorProfile: { strikesCount: 0, followerRange: "FROM_10K_TO_30K", city: "Warszawa", instagramUrl: "https://instagram.com/anna_foodie" },
    },
    campaign: { id: "demo-camp-001", title: "Letnie menu — reels & stories", deliverablesJson: CAMPAIGNS[0].deliverablesJson, contentDeadlineDays: 7 },
    slot: SLOTS[5],
    contentSubmission: {
      id: "demo-cs-003",
      bookingId: "demo-booking-005",
      linksJson: [
        { type: "IG_REEL", url: "https://instagram.com/reel/demo_prev1", description: "Reel: Pasta carbonara od szefa kuchni", thumbnailUrl: "https://picsum.photos/seed/reel2/400/500" },
        { type: "IG_STORY", url: "https://instagram.com/stories/demo_prev2", description: "Stories z kuchni", thumbnailUrl: "https://picsum.photos/seed/story2/400/700" },
        { type: "IG_STORY", url: "https://instagram.com/stories/demo_prev3", description: "Stories z wnętrza restauracji", thumbnailUrl: "https://picsum.photos/seed/story3/400/700" },
      ],
      submittedAt: addDays(now, -6).toISOString(),
      restaurantApprovedAt: addDays(now, -5).toISOString(),
      status: "APPROVED",
    },
    agreement: { id: "demo-agreement-005", status: "SIGNED" },
  },
];

const DEMO_USERS = [
  { id: "demo-creator-001", email: "creator@demo.pl", nameDisplay: "Anna Kowalska", role: "CREATOR", status: "ACTIVE", suspendedUntil: null, createdAt: addDays(now, -14).toISOString(), lastLoginAt: now.toISOString(), creatorProfile: { strikesCount: 0, followerRange: "FROM_10K_TO_30K", city: "Warszawa", instagramUrl: "https://instagram.com/anna_foodie", tiktokUrl: "https://tiktok.com/@anna_foodie", portfolioUrl: null, niches: ["food", "lifestyle"], languages: ["pl", "en"], fullName: "Anna Maria Kowalska", pesel: "92010112345" } },
  { id: "demo-creator-002", email: "creator2@demo.pl", nameDisplay: "Marek Nowak", role: "CREATOR", status: "ACTIVE", suspendedUntil: null, createdAt: addDays(now, -10).toISOString(), lastLoginAt: addDays(now, -2).toISOString(), creatorProfile: { strikesCount: 0, followerRange: "FROM_2K_TO_10K", city: "Kraków", instagramUrl: "https://instagram.com/marek_eats", tiktokUrl: null, portfolioUrl: "https://marek-eats.pl", niches: ["food", "travel", "photography"], languages: ["pl"], fullName: "Marek Jan Nowak", pesel: "89052067890" } },
  { id: "demo-restaurant-001", email: "restauracja@demo.pl", nameDisplay: "Jan Restaurator", role: "RESTAURANT_OWNER", status: "ACTIVE", suspendedUntil: null, createdAt: addDays(now, -30).toISOString(), lastLoginAt: now.toISOString(), creatorProfile: null },
  { id: "demo-admin-001", email: "admin@demo.pl", nameDisplay: "Admin CONTENT", role: "ADMIN", status: "ACTIVE", suspendedUntil: null, createdAt: addDays(now, -60).toISOString(), lastLoginAt: now.toISOString(), creatorProfile: null },
  { id: "demo-pending-creator", email: "kasia@demo.pl", nameDisplay: "Kasia Wiśniewska", role: "CREATOR", status: "PENDING_VERIFICATION", suspendedUntil: null, createdAt: addDays(now, -1).toISOString(), lastLoginAt: null, creatorProfile: null },
  { id: "demo-pending-restaurant", email: "piotr@demo.pl", nameDisplay: "Piotr Gastro", role: "RESTAURANT_OWNER", status: "PENDING_VERIFICATION", suspendedUntil: null, createdAt: addDays(now, -1).toISOString(), lastLoginAt: null, creatorProfile: null },
];

const NOTIFICATIONS_CREATOR = [
  { id: "demo-notif-001", userId: "demo-creator-001", type: "APPLICATION_ACCEPTED", title: "Aplikacja zaakceptowana!", body: "Twoja aplikacja na kampanię \"Letnie menu — reels & stories\" została zaakceptowana.", link: "/creator/booking/demo-booking-001", read: true, emailSent: false, createdAt: addDays(now, -3).toISOString() },
  { id: "demo-notif-002", userId: "demo-creator-001", type: "CONFIRM_VISIT", title: "Potwierdź wizytę", body: "Masz oczekującą wizytę w Sushi Zen. Potwierdź do 12h.", link: "/creator/moje", read: false, emailSent: false, createdAt: addHours(now, -2).toISOString() },
];

const NOTIFICATIONS_RESTAURANT = [
  { id: "demo-notif-003", userId: "demo-restaurant-001", type: "NEW_APPLICATION", title: "Nowa aplikacja", body: "Marek Nowak aplikował na kampanię \"Letnie menu — reels & stories\".", link: "/restaurant/applications", read: false, emailSent: false, createdAt: addHours(now, -5).toISOString() },
  { id: "demo-notif-004", userId: "demo-restaurant-001", type: "CONTENT_SUBMITTED", title: "Content dostarczony", body: "Anna Kowalska przesłała content do kampanii \"Letnie menu\". Sprawdź i zatwierdź.", link: "/restaurant/bookings/demo-booking-001", read: false, emailSent: false, createdAt: addHours(now, -1).toISOString() },
];

const NOTIFICATIONS_ADMIN = [
  { id: "demo-notif-005", userId: "demo-admin-001", type: "NEW_APPLICATION", title: "Platforma rośnie!", body: "Nowi użytkownicy zarejestrowali się na platformie.", link: "/admin/dashboard", read: false, emailSent: false, createdAt: addHours(now, -3).toISOString() },
];

const APPLICATIONS = [
  { id: "demo-app-001", campaignId: "demo-camp-001", creatorUserId: "demo-creator-001", message: "Cześć! Uwielbiam włoską kuchnię i chętnie stworzę content z Waszego letniego menu.", preferredSlotIds: ["demo-slot-001", "demo-slot-002"], status: "ACCEPTED", rejectionReason: null, createdAt: addDays(now, -4).toISOString(), updatedAt: addDays(now, -4).toISOString(), creator: DEMO_USERS[0], campaign: { id: "demo-camp-001", title: "Letnie menu — reels & stories" } },
  { id: "demo-app-002", campaignId: "demo-camp-001", creatorUserId: "demo-creator-002", message: "Hej! Jestem z Krakowa ale będę w Warszawie w przyszłym tygodniu. Mogę zrobić super reels!", preferredSlotIds: ["demo-slot-002"], status: "APPLIED", rejectionReason: null, createdAt: addDays(now, -2).toISOString(), updatedAt: addDays(now, -2).toISOString(), creator: DEMO_USERS[1], campaign: { id: "demo-camp-001", title: "Letnie menu — reels & stories" } },
  { id: "demo-app-003", campaignId: "demo-camp-002", creatorUserId: "demo-creator-001", message: "Sushi to moje ulubione! TikTok z mukbangiem będzie super 🍣", preferredSlotIds: ["demo-slot-003"], status: "ACCEPTED", rejectionReason: null, createdAt: addDays(now, -3).toISOString(), updatedAt: addDays(now, -3).toISOString(), creator: DEMO_USERS[0], campaign: { id: "demo-camp-002", title: "Sushi experience — TikTok" } },
  { id: "demo-app-004", campaignId: "demo-camp-002", creatorUserId: "demo-creator-002", message: "Sushi content to moja specjalność!", preferredSlotIds: ["demo-slot-004"], status: "ACCEPTED", rejectionReason: null, createdAt: addDays(now, -2).toISOString(), updatedAt: addDays(now, -2).toISOString(), creator: DEMO_USERS[1], campaign: { id: "demo-camp-002", title: "Sushi experience — TikTok" } },
];

const AGREEMENTS = [
  {
    id: "demo-agreement-001",
    bookingId: "demo-booking-001",
    campaignTitle: "Letnie menu — reels & stories",
    restaurantCompanyName: "Trattoria Bella Sp. z o.o.",
    restaurantNip: "5213456789",
    restaurantAddress: "ul. Marszałkowska 42, 00-001 Warszawa",
    creatorFullName: "Anna Maria Kowalska",
    creatorPesel: "92010112345",
    deliverablesJson: CAMPAIGNS[0].deliverablesJson,
    offerDescription: "Degustacja 3 dań + napój (wartość ok. 120 zł)",
    contentDeadlineDays: 7,
    copyrightClause: "non_exclusive_license",
    confidentialityDays: 365,
    status: "SIGNED",
    restaurantSignedAt: addDays(now, -4).toISOString(),
    creatorSignedAt: addDays(now, -3).toISOString(),
    createdAt: addDays(now, -4).toISOString(),
    updatedAt: addDays(now, -3).toISOString(),
    booking: { id: "demo-booking-001", creatorUserId: "demo-creator-001", restaurantId: "demo-rest-001", restaurant: { id: "demo-rest-001", name: "Trattoria Bella", ownerUserId: "demo-restaurant-001" } },
  },
  {
    id: "demo-agreement-002",
    bookingId: "demo-booking-002",
    campaignTitle: "Sushi experience — TikTok",
    restaurantCompanyName: "Sushi Zen S.C. Tanaka & Kowalski",
    restaurantNip: "5219876543",
    restaurantAddress: "ul. Nowy Świat 18, 00-001 Warszawa",
    creatorFullName: "Anna Maria Kowalska",
    creatorPesel: "92010112345",
    deliverablesJson: CAMPAIGNS[1].deliverablesJson,
    offerDescription: "All-you-can-eat sushi (wartość ok. 89 zł)",
    contentDeadlineDays: 5,
    copyrightClause: "non_exclusive_license",
    confidentialityDays: 365,
    status: "PENDING_CREATOR",
    restaurantSignedAt: addDays(now, -1).toISOString(),
    creatorSignedAt: null,
    createdAt: addDays(now, -1).toISOString(),
    updatedAt: addDays(now, -1).toISOString(),
    booking: { id: "demo-booking-002", creatorUserId: "demo-creator-001", restaurantId: "demo-rest-002", restaurant: { id: "demo-rest-002", name: "Sushi Zen", ownerUserId: "demo-restaurant-001" } },
  },
  {
    id: "demo-agreement-003",
    bookingId: "demo-booking-003",
    campaignTitle: "Letnie menu — reels & stories",
    restaurantCompanyName: "Trattoria Bella Sp. z o.o.",
    restaurantNip: "5213456789",
    restaurantAddress: "ul. Marszałkowska 42, 00-001 Warszawa",
    creatorFullName: "Anna Maria Kowalska",
    creatorPesel: "92010112345",
    deliverablesJson: CAMPAIGNS[0].deliverablesJson,
    offerDescription: "Degustacja 3 dań + napój (wartość ok. 120 zł)",
    contentDeadlineDays: 7,
    copyrightClause: "non_exclusive_license",
    confidentialityDays: 365,
    status: "SIGNED",
    restaurantSignedAt: addDays(now, -1).toISOString(),
    creatorSignedAt: addDays(now, -1).toISOString(),
    createdAt: addDays(now, -1).toISOString(),
    updatedAt: addDays(now, -1).toISOString(),
    booking: { id: "demo-booking-003", creatorUserId: "demo-creator-001", restaurantId: "demo-rest-001", restaurant: { id: "demo-rest-001", name: "Trattoria Bella", ownerUserId: "demo-restaurant-001" } },
  },
  {
    id: "demo-agreement-005",
    bookingId: "demo-booking-005",
    campaignTitle: "Letnie menu — reels & stories",
    restaurantCompanyName: "Trattoria Bella Sp. z o.o.",
    restaurantNip: "5213456789",
    restaurantAddress: "ul. Marszałkowska 42, 00-001 Warszawa",
    creatorFullName: "Anna Maria Kowalska",
    creatorPesel: "92010112345",
    deliverablesJson: CAMPAIGNS[0].deliverablesJson,
    offerDescription: "Degustacja 3 dań + napój (wartość ok. 120 zł)",
    contentDeadlineDays: 7,
    copyrightClause: "non_exclusive_license",
    confidentialityDays: 365,
    status: "SIGNED",
    restaurantSignedAt: addDays(now, -12).toISOString(),
    creatorSignedAt: addDays(now, -12).toISOString(),
    createdAt: addDays(now, -14).toISOString(),
    updatedAt: addDays(now, -12).toISOString(),
    booking: { id: "demo-booking-005", creatorUserId: "demo-creator-001", restaurantId: "demo-rest-001", restaurant: { id: "demo-rest-001", name: "Trattoria Bella", ownerUserId: "demo-restaurant-001" } },
  },
];

const REPORTS = [
  { id: "demo-report-001", bookingId: "demo-booking-001", reporterRole: "RESTAURANT_OWNER", type: "OTHER", description: "Testowy raport — przykładowe zgłoszenie do moderacji.", status: "OPEN", createdAt: addHours(now, -6).toISOString(), resolvedAt: null, resolvedBy: null, booking: { ...BOOKINGS[0], restaurant: RESTAURANTS[0] } },
];

// Export functions

export function getDemoCampaigns() {
  return CAMPAIGNS.filter((c) => c.status === "ACTIVE");
}

export function getAllDemoCampaigns() {
  return CAMPAIGNS;
}

export function getDemoCampaign(id: string) {
  return CAMPAIGNS.find((c) => c.id === id) ?? null;
}

export function getDemoRestaurants() {
  return RESTAURANTS;
}

export function getDemoBookings(userId?: string) {
  if (userId) return BOOKINGS.filter((b) => b.creatorUserId === userId);
  return BOOKINGS;
}

export function getDemoBooking(id: string) {
  return BOOKINGS.find((b) => b.id === id) ?? null;
}

export function getDemoNotifications(userId: string) {
  if (userId === "demo-creator-001") return NOTIFICATIONS_CREATOR;
  if (userId === "demo-restaurant-001") return NOTIFICATIONS_RESTAURANT;
  if (userId === "demo-admin-001") return NOTIFICATIONS_ADMIN;
  return [];
}

export function getDemoUsers(filters?: { status?: string; role?: string }) {
  let users = DEMO_USERS;
  if (filters?.status) users = users.filter((u) => u.status === filters.status);
  if (filters?.role) users = users.filter((u) => u.role === filters.role);
  return users;
}

export function getDemoReports() {
  return REPORTS;
}

export function getDemoApplications(campaignId?: string) {
  if (campaignId) return APPLICATIONS.filter((a) => a.campaignId === campaignId);
  return APPLICATIONS;
}

export function getDemoCreatorApplications(userId: string) {
  return APPLICATIONS.filter((a) => a.creatorUserId === userId);
}

export function getDemoCreatorProfile(userId: string) {
  const user = DEMO_USERS.find((u) => u.id === userId && u.role === "CREATOR");
  if (!user || !user.creatorProfile) return null;
  const completedBookings = BOOKINGS.filter(
    (b) => b.creatorUserId === userId && ["VISITED", "COMPLETED", "CONTENT_SUBMITTED"].includes(b.status)
  );

  // Build portfolio from approved content submissions
  const portfolio = BOOKINGS
    .filter((b) => b.creatorUserId === userId && b.contentSubmission && b.contentSubmission.status === "APPROVED")
    .flatMap((b) => {
      const links = b.contentSubmission!.linksJson as { type: string; url: string; description?: string; thumbnailUrl?: string }[];
      return links.map((link) => ({
        type: link.type,
        url: link.url,
        description: link.description || null,
        thumbnailUrl: link.thumbnailUrl || null,
        campaignTitle: b.campaign.title,
        restaurantName: RESTAURANTS.find((r) => r.id === b.restaurantId)?.name || "",
        submittedAt: b.contentSubmission!.submittedAt,
      }));
    });

  return {
    user: {
      id: user.id,
      nameDisplay: user.nameDisplay,
      createdAt: user.createdAt,
    },
    profile: user.creatorProfile,
    stats: {
      completedCollabs: completedBookings.length,
      contentSubmitted: BOOKINGS.filter((b) => b.creatorUserId === userId && b.contentSubmission).length,
    },
    portfolio,
  };
}

export function getDemoLibrary() {
  return BOOKINGS.filter((b) => b.contentSubmission).map((b) => ({
    ...b.contentSubmission,
    booking: b,
  }));
}

export function getDemoAgreements(userId?: string) {
  if (!userId) return AGREEMENTS;
  // Find bookings for this user
  const userBookingIds = BOOKINGS.filter(b => b.creatorUserId === userId).map(b => b.id);
  return AGREEMENTS.filter(a => userBookingIds.includes(a.bookingId));
}

export function getDemoRestaurantAgreements(restaurantIds: string[]) {
  const restaurantBookingIds = BOOKINGS.filter(b => restaurantIds.includes(b.restaurantId)).map(b => b.id);
  return AGREEMENTS.filter(a => restaurantBookingIds.includes(a.bookingId));
}

export function getDemoAgreement(id: string) {
  return AGREEMENTS.find(a => a.id === id) ?? null;
}

export function getDemoAgreementByBooking(bookingId: string) {
  return AGREEMENTS.find(a => a.bookingId === bookingId) ?? null;
}
