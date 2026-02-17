const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 560px;
  margin: 0 auto;
  padding: 40px 24px;
  color: #1f2937;
`;

const buttonStyle = `
  display: inline-block;
  background-color: #f97316;
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
`;

function wrap(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="pl">
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="background-color: #f9fafb; margin: 0; padding: 0;">
      <div style="${baseStyle}">
        <div style="text-align: center; margin-bottom: 32px;">
          <span style="font-size: 24px; font-weight: 800; color: #1f2937;">CONTENT</span>
        </div>
        ${content}
        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #9ca3af;">
          CONTENT — platforma barterowa dla restauracji i twórców
        </div>
      </div>
    </body>
    </html>
  `;
}

export function accountApprovedTemplate(name: string): { subject: string; html: string } {
  return {
    subject: "Twoje konto zostało zatwierdzone! 🎉",
    html: wrap(`
      <h2 style="font-size: 20px; margin-bottom: 16px;">Cześć ${name}!</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
        Twoje konto na platformie CONTENT zostało zatwierdzone przez administratora.
        Możesz się teraz zalogować i rozpocząć korzystanie z platformy.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${process.env.NEXTAUTH_URL || "https://content-prod.vercel.app"}/login" style="${buttonStyle}">
          Zaloguj się
        </a>
      </div>
    `),
  };
}

export function applicationAcceptedTemplate(campaignTitle: string): { subject: string; html: string } {
  return {
    subject: `Zgłoszenie zaakceptowane — ${campaignTitle}`,
    html: wrap(`
      <h2 style="font-size: 20px; margin-bottom: 16px;">Gratulacje! 🎉</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
        Twoje zgłoszenie do kampanii <strong>"${campaignTitle}"</strong> zostało zaakceptowane.
        Sprawdź szczegóły wizyty w swoim panelu.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${process.env.NEXTAUTH_URL || "https://content-prod.vercel.app"}/creator/moje" style="${buttonStyle}">
          Zobacz szczegóły
        </a>
      </div>
    `),
  };
}

export function newApplicationTemplate(campaignTitle: string, creatorName: string): { subject: string; html: string } {
  return {
    subject: `Nowe zgłoszenie — ${campaignTitle}`,
    html: wrap(`
      <h2 style="font-size: 20px; margin-bottom: 16px;">Nowa aplikacja</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
        <strong>${creatorName}</strong> złożył zgłoszenie do kampanii <strong>"${campaignTitle}"</strong>.
        Sprawdź profil twórcy i zdecyduj o akceptacji.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${process.env.NEXTAUTH_URL || "https://content-prod.vercel.app"}/restaurant/applications" style="${buttonStyle}">
          Przejrzyj zgłoszenia
        </a>
      </div>
    `),
  };
}

export function contentSubmittedTemplate(campaignTitle: string, creatorName: string): { subject: string; html: string } {
  return {
    subject: `Nowy content do weryfikacji — ${campaignTitle}`,
    html: wrap(`
      <h2 style="font-size: 20px; margin-bottom: 16px;">Content dostarczony</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
        <strong>${creatorName}</strong> przesłał content dla kampanii <strong>"${campaignTitle}"</strong>.
        Sprawdź materiały i zatwierdź lub poproś o poprawki.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${process.env.NEXTAUTH_URL || "https://content-prod.vercel.app"}/restaurant/bookings" style="${buttonStyle}">
          Sprawdź content
        </a>
      </div>
    `),
  };
}
