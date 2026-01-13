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
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { padding: 40px 20px; text-align: center; background: linear-gradient(135deg, #007bff, #0056b3); color: white; }
        .header h1 { margin: 0; font-size: 28px; letter-spacing: -1px; }
        .header p { margin: 10px 0 0; opacity: 0.9; font-size: 14px; }
        
        .global-summary { padding: 30px 20px; background-color: #f0f7ff; border-bottom: 1px solid #e1e8ed; }
        .global-summary h2 { margin-top: 0; font-size: 18px; color: #007bff; display: flex; align-items: center; }
        
        .section { padding: 20px; }
        .category-title { font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #4b5563; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px; margin: 40px 0 20px; }
        
        .article-card { margin-bottom: 35px; border-radius: 12px; overflow: hidden; }
        .article-img { width: 100%; height: 220px; object-fit: cover; border-radius: 12px; border: 1px solid #eee; }
        .article-content { padding: 15px 5px; }
        .article-title { font-size: 19px; font-weight: 700; margin: 10px 0; color: #111827; text-decoration: none; display: block; }
        .article-summary { color: #4b5563; font-size: 15px; margin-bottom: 15px; }
        .article-link { color: #007bff; font-weight: 600; font-size: 14px; text-decoration: none; text-transform: uppercase; }
        
        .footer { padding: 40px 20px; text-align: center; font-size: 12px; color: #9ca3af; background-color: #f9fafb; }
      </style>
    </head>
    <body>
      <div class="container">
       <div class="header">
  <h1>🗞️ Brief Matinal</h1>
  <p>${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
  
  <div style="margin-top: 20px; background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; display: inline-block;">
    <span style="font-size: 20px;">🌡️ ${curatedNews.weather_stats.temp}</span> | 
    <span style="font-size: 20px;">💧 ${curatedNews.weather_stats.rain} pluie</span>
  </div>
</div>

<div class="global-summary" style="background-color: #fff9e6; border-left: 5px solid #ffcc00;">
  <h2 style="color: #d4a017;">🏃‍♂️ Le Conseil du Coach</h2>
  <p style="font-style: italic;">"${curatedNews.running_advice}"</p>
</div>

        <div class="global-summary">
          <h2>☕ L'essentiel en un coup d'œil</h2>
          <p>${curatedNews.global_summary}</p>
        </div>

        <div class="section">
          ${curatedNews.categories.map((cat: any) => `
            <div class="category-title">${cat.emoji} ${cat.label}</div>
            
            ${cat.articles.map((art: any) => `
              <div class="article-card">
                ${art.image ? `<img src="${art.image}" class="article-img" alt="News Image">` : ''}
                <div class="article-content">
                  <a href="${art.url}" class="article-title">${art.title}</a>
                  <p class="article-summary">${art.summary}</p>
                  <a href="${art.url}" class="article-link">Lire la suite →</a>
                </div>
              </div>
            `).join('')}
          `).join('')}
        </div>

        <div class="footer">
          <p>Propulsé par <b>Gemini 2.0 Flash</b> & NewsData API</p>
          <p>Vous recevez ce mail car vous êtes un utilisateur de DailyBrief AI.</p>
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
    console.log("📧 Email ultra-moderne envoyé !");
  } catch (err) {
    console.error("❌ Erreur Mail:", err);
  }
}