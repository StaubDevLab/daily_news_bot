import { Resend } from 'resend';

export async function sendDailyEmail(curatedNews: any) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f4f7f9; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; overflow: hidden; }
        
        /* Header avec dégradé et Météo */
        .header { padding: 40px 20px; text-align: center; background: linear-gradient(135deg, #007bff, #0056b3); color: white; }
        .header h1 { margin: 0; font-size: 28px; letter-spacing: -1px; }
        .header p { margin: 5px 0 0; opacity: 0.9; font-size: 14px; text-transform: capitalize; }
        .weather-badge { margin-top: 20px; background: rgba(255,255,255,0.15); padding: 10px 20px; border-radius: 30px; display: inline-block; font-weight: 600; font-size: 15px; border: 1px solid rgba(255,255,255,0.2); }
        
        /* Sections de résumé */
        .coach-card { padding: 25px 20px; background-color: #fffdf2; border-bottom: 1px solid #fef3c7; }
        .coach-card h2 { margin-top: 0; font-size: 16px; color: #b45309; text-transform: uppercase; letter-spacing: 1px; }
        .coach-text { margin: 0; font-size: 15px; color: #92400e; font-style: italic; line-height: 1.5; }
        
        .summary-card { padding: 25px 20px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; }
        .summary-card h2 { margin-top: 0; font-size: 16px; color: #1e40af; text-transform: uppercase; letter-spacing: 1px; }
        .summary-text { margin: 0; font-size: 15px; color: #334155; white-space: pre-line; }

        /* Articles */
        .section { padding: 20px; }
        .category-title { font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #64748b; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin: 40px 0 20px; }
        
        .article-card { margin-bottom: 40px; }
        .article-img { width: 100%; height: 240px; object-fit: cover; border-radius: 12px; background-color: #f1f5f9; }
        .article-content { padding: 15px 5px; }
        .article-title { font-size: 20px; font-weight: 700; margin: 10px 0; color: #0f172a; text-decoration: none; display: block; line-height: 1.3; }
        .article-summary { color: #475569; font-size: 15px; margin-bottom: 12px; }
        .article-link { color: #007bff; font-weight: 700; font-size: 13px; text-decoration: none; text-transform: uppercase; letter-spacing: 0.5px; }
        
        .footer { padding: 40px 20px; text-align: center; font-size: 12px; color: #94a3b8; background-color: #f8fafc; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🗞️ Brief Matinal</h1>
          <p>${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}${curatedNews.ephemeride ? ` • ${curatedNews.ephemeride}` : ''}</p>
          <div class="weather-badge">
            ${curatedNews.weather_string || `🌡️ ${curatedNews.weather_stats.temp} | 💧 ${curatedNews.weather_stats.rain}`}
          </div>
        </div>

        <div class="coach-card">
          <h2>🏃‍♂️ Le Conseil du Coach</h2>
          <p class="coach-text">"${curatedNews.running_advice}"</p>
        </div>

        <div class="summary-card">
          <h2>☕ L'essentiel du jour</h2>
          <p class="summary-text">${curatedNews.global_summary}</p>
        </div>

        <div class="section">
          ${curatedNews.categories.map((cat: any) => `
            <div class="category-title">${cat.emoji} ${cat.label}</div>
            
            ${cat.articles.map((art: any) => `
              <div class="article-card">
                ${art.image ? `<img src="${art.image}" class="article-img" alt="Illustration">` : ''}
                <div class="article-content">
                  <a href="${art.url}" class="article-title">${art.title}</a>
                  <p class="article-summary">${art.summary}</p>
                  <a href="${art.url}" class="article-link">Lire l'article →</a>
                </div>
              </div>
            `).join('')}
          `).join('')}
        </div>

        <div class="footer">
          <p>Propulsé par <b>Gemini 2.0 Flash</b> & NewsData API</p>
          <p>Bordeaux, France • ${new Date().getFullYear()}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: 'DailyBrief <onboarding@resend.dev>',
      to: [process.env.MY_EMAIL || ""],
      subject: `🗞️ Votre Brief : ${new Date().toLocaleDateString('fr-FR')}`,
      html: htmlContent,
    });
    console.log("📧 Email envoyé avec succès !");
  } catch (err) {
    console.error("❌ Erreur lors de l'envoi du mail:", err);
  }
}