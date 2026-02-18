// ---------------------------------------------------------------------------
// agreement-template.ts
// Generates full HTML for a Polish barter agreement (umowa barterowa).
// ---------------------------------------------------------------------------

export interface AgreementData {
  id: string;
  createdAt: string | Date;
  campaignTitle: string;
  restaurantCompanyName: string;
  restaurantNip: string;
  restaurantAddress: string;
  creatorFullName: string;
  creatorPesel: string;
  deliverablesJson: unknown;
  offerDescription: string;
  contentDeadlineDays: number;
  copyrightClause: string;
  confidentialityDays: number;
  status: string;
  restaurantSignedAt: string | Date | null;
  creatorSignedAt: string | Date | null;
}

// ---------------------------------------------------------------------------
// Deliverable type labels
// ---------------------------------------------------------------------------

const DELIVERABLE_LABELS: Record<string, string> = {
  IG_REEL: "Instagram Reels",
  IG_STORY: "Instagram Stories",
  TIKTOK: "TikTok",
  OTHER: "Inne",
};

export function getDeliverableLabel(type: string): string {
  return DELIVERABLE_LABELS[type] ?? type;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format a date (string or Date) as DD.MM.YYYY */
function formatDateDot(iso: string | Date): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

/** Return a short agreement identifier (first 8 chars of the UUID). */
function shortId(id: string): string {
  return id.replace(/-/g, "").slice(0, 8).toUpperCase();
}

/** Mask a PESEL so only the first 6 digits (date of birth) are visible. */
function maskPesel(pesel: string): string {
  if (!pesel || pesel.length < 6) return pesel;
  return pesel.slice(0, 6) + "*".repeat(pesel.length - 6);
}

/** Escape basic HTML special characters to prevent injection. */
function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
// Signature block helper
// ---------------------------------------------------------------------------

function signatureBlock(
  label: string,
  signedAt: string | Date | null,
): string {
  const statusHtml = signedAt
    ? `<span style="color: #16a34a; font-weight: 600;">Podpisano elektronicznie</span><br/><span style="color: #16a34a; font-size: 12px;">${formatDateDot(signedAt)}</span>`
    : `<span style="color: #f97316; font-weight: 600;">Oczekuje na podpis</span>`;

  return `
    <div style="flex: 1; border-top: 1px solid #333; padding-top: 10px;">
      <p style="font-size: 13px; margin: 0 0 4px 0; font-weight: 700;">${esc(label)}</p>
      <p style="font-size: 13px; margin: 0;">${statusHtml}</p>
    </div>`;
}

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

export function generateAgreementHtml(data: AgreementData): string {
  const {
    id,
    createdAt,
    campaignTitle,
    restaurantCompanyName,
    restaurantNip,
    restaurantAddress,
    creatorFullName,
    creatorPesel,
    deliverablesJson,
    offerDescription,
    contentDeadlineDays,
    confidentialityDays,
    restaurantSignedAt,
    creatorSignedAt,
  } = data;

  // Build the deliverables list
  const deliverables = deliverablesJson as Array<{ type: string; quantity: number; description?: string }>;
  const deliverableItems = deliverables
    .map((d) => {
      const label = getDeliverableLabel(d.type);
      const desc = d.description ? ` — ${esc(d.description)}` : "";
      return `<li style="margin-bottom: 4px;">${esc(label)}: <strong>${d.quantity}</strong>${desc}</li>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Umowa barterowa nr ${esc(shortId(id))}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafaf8;">
  <div style="max-width: 800px; margin: 0 auto; font-family: 'Georgia', serif; color: #1a1a1a; line-height: 1.8; padding: 40px;">

    <!-- ===== NAGLOWEK ===== -->
    <h1 style="text-align: center; font-size: 20px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px;">
      Umowa barterowa nr&nbsp;${esc(shortId(id))}
    </h1>
    <p style="text-align: center; font-size: 13px; color: #555; margin-top: 0;">
      zawarta w dniu ${formatDateDot(createdAt)} r.
    </p>

    <!-- ===== KOMPARYCJA ===== -->
    <p style="font-size: 13px; margin-top: 2em;">
      zawarta pomi\u0119dzy:
    </p>

    <p style="font-size: 13px;">
      <strong>1.&nbsp;${esc(restaurantCompanyName)}</strong>,
      NIP:&nbsp;${esc(restaurantNip)},
      z&nbsp;siedzib\u0105 pod adresem: ${esc(restaurantAddress)},
      zwan\u0105 dalej <strong>\u201eZleceniodawc\u0105\u201d</strong>,
    </p>

    <p style="font-size: 13px;">a</p>

    <p style="font-size: 13px;">
      <strong>2.&nbsp;${esc(creatorFullName)}</strong>,
      PESEL:&nbsp;${maskPesel(creatorPesel)},
      zwanym/zwan\u0105 dalej <strong>\u201eTw\u00f3rc\u0105\u201d</strong>,
    </p>

    <p style="font-size: 13px;">
      zwanymi dalej \u0142\u0105cznie <strong>\u201eStronami\u201d</strong>,
      a&nbsp;ka\u017cd\u0105 z&nbsp;osobna <strong>\u201eStron\u0105\u201d</strong>.
    </p>

    <!-- ===== \u00a71 PRZEDMIOT UMOWY ===== -->
    <h3 style="margin-top: 2em; font-size: 14px;">\u00a7\u00a01 \u2014 Przedmiot umowy</h3>

    <p style="font-size: 13px;">
      1.&nbsp;Strony postanawiaj\u0105 dokona\u0107 wymiany barterowej w&nbsp;zwi\u0105zku z&nbsp;kampani\u0105
      <strong>\u201e${esc(campaignTitle)}\u201d</strong>.
    </p>
    <p style="font-size: 13px;">
      2.&nbsp;W&nbsp;ramach niniejszej umowy Zleceniodawca zapewnia Tw\u00f3rcy posi\u0142ek lub do\u015bwiadczenie
      gastronomiczne, a&nbsp;Tw\u00f3rca zobowi\u0105zuje si\u0119 do przygotowania i&nbsp;opublikowania
      materia\u0142\u00f3w promocyjnych (dalej: \u201eTre\u015bci\u201d) na swoich kana\u0142ach w&nbsp;mediach
      spo\u0142eczno\u015bciowych.
    </p>
    <p style="font-size: 13px;">
      3.&nbsp;\u017badna ze Stron nie jest zobowi\u0105zana do \u015bwiadczenia pieni\u0119\u017cnego na rzecz
      drugiej Strony w&nbsp;zwi\u0105zku z&nbsp;realizacj\u0105 niniejszej umowy.
    </p>

    <!-- ===== \u00a72 \u015aWIADCZENIA STRON ===== -->
    <h3 style="margin-top: 2em; font-size: 14px;">\u00a7\u00a02 \u2014 \u015awiadczenia stron</h3>

    <p style="font-size: 13px;">
      <strong>Zleceniodawca zobowi\u0105zuje si\u0119 do:</strong>
    </p>
    <p style="font-size: 13px; padding-left: 20px;">
      Zapewnienia Tw\u00f3rcy nast\u0119puj\u0105cego \u015bwiadczenia:
      <em>${esc(offerDescription)}</em>.
    </p>

    <p style="font-size: 13px;">
      <strong>Tw\u00f3rca zobowi\u0105zuje si\u0119 do:</strong>
    </p>
    <p style="font-size: 13px; padding-left: 20px;">
      Przygotowania i&nbsp;opublikowania nast\u0119puj\u0105cych Tre\u015bci:
    </p>
    <ul style="font-size: 13px; padding-left: 40px;">
      ${deliverableItems}
    </ul>

    <!-- ===== \u00a73 TERMINY REALIZACJI ===== -->
    <h3 style="margin-top: 2em; font-size: 14px;">\u00a7\u00a03 \u2014 Terminy realizacji</h3>

    <p style="font-size: 13px;">
      1.&nbsp;Tw\u00f3rca zobowi\u0105zuje si\u0119 dostarczy\u0107 Tre\u015bci w&nbsp;ci\u0105gu
      <strong>${contentDeadlineDays}&nbsp;dni</strong> od daty wizyty w&nbsp;lokalu Zleceniodawcy.
    </p>
    <p style="font-size: 13px;">
      2.&nbsp;Zleceniodawca zobowi\u0105zuje si\u0119 do zatwierdzenia lub zg\u0142oszenia uwag do
      dostarczonych Tre\u015bci w&nbsp;ci\u0105gu <strong>3&nbsp;dni roboczych</strong> od ich otrzymania.
      Brak odpowiedzi w&nbsp;tym terminie uznaje si\u0119 za akceptacj\u0119 Tre\u015bci.
    </p>

    <!-- ===== \u00a74 PRAWA AUTORSKIE ===== -->
    <h3 style="margin-top: 2em; font-size: 14px;">\u00a7\u00a04 \u2014 Prawa autorskie</h3>

    <p style="font-size: 13px;">
      1.&nbsp;Tw\u00f3rca udziela Zleceniodawcy niewy\u0142\u0105cznej, nieodp\u0142atnej licencji na
      korzystanie z&nbsp;dostarczonych Tre\u015bci na nast\u0119puj\u0105cych polach eksploatacji:
    </p>
    <ul style="font-size: 13px; padding-left: 40px;">
      <li style="margin-bottom: 4px;">publikacja na profilach Zleceniodawcy w&nbsp;mediach spo\u0142eczno\u015bciowych,</li>
      <li style="margin-bottom: 4px;">wykorzystanie w&nbsp;materia\u0142ach marketingowych i&nbsp;reklamowych Zleceniodawcy,</li>
      <li style="margin-bottom: 4px;">udost\u0119pnianie na stronie internetowej Zleceniodawcy.</li>
    </ul>
    <p style="font-size: 13px;">
      2.&nbsp;Tw\u00f3rca zachowuje autorskie prawa osobiste do utwor\u00f3w, w&nbsp;tym prawo do
      oznaczenia autorstwa.
    </p>
    <p style="font-size: 13px;">
      3.&nbsp;Licencja, o&nbsp;kt\u00f3rej mowa w&nbsp;ust.&nbsp;1, udzielana jest na czas nieokre\u015blony
      i&nbsp;obejmuje terytorium ca\u0142ego \u015bwiata.
    </p>

    <!-- ===== \u00a75 OZNACZENIE TRE\u015aCI REKLAMOWYCH ===== -->
    <h3 style="margin-top: 2em; font-size: 14px;">\u00a7\u00a05 \u2014 Oznaczenie tre\u015bci reklamowych</h3>

    <p style="font-size: 13px;">
      1.&nbsp;Tw\u00f3rca zobowi\u0105zuje si\u0119 do oznaczania publikowanych Tre\u015bci zgodnie
      z&nbsp;obowi\u0105zuj\u0105cymi przepisami prawa oraz wytycznymi Prezesa Urz\u0119du Ochrony
      Konkurencji i&nbsp;Konsument\u00f3w (UOKiK).
    </p>
    <p style="font-size: 13px;">
      2.&nbsp;Ka\u017cda opublikowana Tre\u015b\u0107 musi zawiera\u0107 widoczne oznaczenie
      <strong>\u201eWsp\u00f3\u0142praca barterowa\u201d</strong> lub r\u00f3wnowa\u017cne sformu\u0142owanie
      jednoznacznie wskazuj\u0105ce na reklamowy charakter publikacji.
    </p>

    <!-- ===== \u00a76 POUFNO\u015a\u0106 ===== -->
    <h3 style="margin-top: 2em; font-size: 14px;">\u00a7\u00a06 \u2014 Poufno\u015b\u0107</h3>

    <p style="font-size: 13px;">
      1.&nbsp;Strony zobowi\u0105zuj\u0105 si\u0119 do zachowania w&nbsp;tajemnicy wszelkich informacji
      uzyskanych w&nbsp;zwi\u0105zku z&nbsp;realizacj\u0105 niniejszej umowy, kt\u00f3re nie s\u0105
      publicznie dost\u0119pne.
    </p>
    <p style="font-size: 13px;">
      2.&nbsp;Obowi\u0105zek poufno\u015bci obowi\u0105zuje przez okres
      <strong>${confidentialityDays}&nbsp;dni</strong> od dnia zawarcia niniejszej umowy.
    </p>

    <!-- ===== \u00a77 POSTANOWIENIA KO\u0143COWE ===== -->
    <h3 style="margin-top: 2em; font-size: 14px;">\u00a7\u00a07 \u2014 Postanowienia ko\u0144cowe</h3>

    <p style="font-size: 13px;">
      1.&nbsp;W&nbsp;sprawach nieuregulowanych niniejsz\u0105 umow\u0105 zastosowanie maj\u0105 przepisy
      ustawy z&nbsp;dnia 23&nbsp;kwietnia 1964&nbsp;r. \u2014 Kodeks cywilny (Dz.U. z&nbsp;2023&nbsp;r.
      poz.&nbsp;1610 ze zm.) oraz inne w\u0142a\u015bciwe przepisy prawa polskiego.
    </p>
    <p style="font-size: 13px;">
      2.&nbsp;Wszelkie spory wynikaj\u0105ce z&nbsp;niniejszej umowy b\u0119d\u0105 rozstrzygane przez
      s\u0105d w\u0142a\u015bciwy dla siedziby Zleceniodawcy.
    </p>
    <p style="font-size: 13px;">
      3.&nbsp;Wszelkie zmiany niniejszej umowy wymagaj\u0105 formy pisemnej lub elektronicznej pod
      rygorem niewa\u017cno\u015bci.
    </p>
    <p style="font-size: 13px;">
      4.&nbsp;Umow\u0119 sporz\u0105dzono w&nbsp;formie elektronicznej, dost\u0119pnej dla obu Stron
      za po\u015brednictwem platformy CONTENT.
    </p>

    <!-- ===== PODPISY ===== -->
    <div style="display: flex; gap: 40px; margin-top: 3em;">
      ${signatureBlock("Zleceniodawca", restaurantSignedAt)}
      ${signatureBlock("Tw\u00f3rca", creatorSignedAt)}
    </div>

  </div>
</body>
</html>`;
}
