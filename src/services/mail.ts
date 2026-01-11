import { Resend } from 'resend';

export async function sendDailyEmail(curatedNews: any) {
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Construction du corps du mail en HTML
    // On utilise un style simple et épuré (inspiré des newsletters tech)
    const htmlContent = `
   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="text-align: center;">🗞️ Le Brief Matinal</h1>
    
    <div style="background-color: #eef6ff; padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 5px solid #007bff;">
      <h2 style="margin-top: 0; font-size: 16px; color: #007bff;">☕ L'essentiel en 30 secondes</h2>
      <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #333;">${curatedNews.global_summary}</p>
    </div>
      
      ${curatedNews.categories.map((cat: any) => `
        <div style="margin-top: 30px;">
          <h2 style="background-color: #f8f9fa; padding: 10px; border-left: 5px solid #007bff; font-size: 18px;">
            ${cat.emoji} ${cat.label.toUpperCase()}
          </h2>
          <div style="padding: 0 10px;">
            ${cat.articles.map((art: any) => `
  <div style="margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px;">
    ${art.image ? `<img src="${art.image}" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;" />` : ''}
    <h3 style="margin: 0;"><a href="${art.url}" style="color: #1a1a1a; text-decoration: none;">${art.title}</a></h3>
    <p style="color: #555; font-size: 14px;">${art.summary}</p>
  </div>
`).join('')}
          </div>
        </div>
      `).join('')}
      
      <footer style="margin-top: 40px; padding: 20px; text-align: center; font-size: 11px; color: #999;">
        <p>Généré par Gemini 2.0 Flash • Données APITube & Sud-Ouest</p>
      </footer>
    </div>
  `;

    try {
        const { data, error } = await resend.emails.send({
            from: 'Mon Robot <onboarding@resend.dev>', // Tu pourras changer ça avec ton domaine plus tard
            to: [process.env.MY_EMAIL || ""],
            subject: `🗞️ Brief du ${new Date().toLocaleDateString('fr-FR')}`,
            html: htmlContent,
        });

        if (error) {
            return console.error("❌ Erreur Resend:", error);
        }
        console.log("📧 Mail envoyé avec succès !", data?.id);
    } catch (err) {
        console.error("❌ Erreur lors de l'envoi du mail:", err);
    }
}