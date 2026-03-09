import { CuratedNews } from '../types';

export function generateHtml(curatedNews: CuratedNews): string {
    return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Votre Brief Matinal - ${new Date().toLocaleDateString('fr-FR')}</title>
      <style>
        /* Reset & Base */
        body { 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6; 
          color: #374151; 
          margin: 0; 
          padding: 0; 
          background-color: #f3f4f6; 
        }
        .wrapper { padding: 40px 20px; }
        .container { 
          max-width: 640px; 
          margin: 0 auto; 
          background-color: #ffffff; 
          border-radius: 24px; 
          overflow: hidden;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }
        
        /* Header */
        .header { 
          padding: 50px 30px; 
          text-align: center; 
          background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); 
          color: white; 
        }
        .header h1 { 
          margin: 0; 
          font-size: 32px; 
          font-weight: 800;
          letter-spacing: -1px; 
        }
        .header .date { 
          margin: 10px 0 0; 
          opacity: 0.9; 
          font-size: 16px; 
          font-weight: 500;
          text-transform: capitalize; 
        }
        .weather-badge { 
          margin-top: 25px; 
          background: rgba(255,255,255,0.2); 
          padding: 10px 20px; 
          border-radius: 9999px; 
          display: inline-block; 
          font-weight: 600; 
          font-size: 14px; 
          border: 1px solid rgba(255,255,255,0.3); 
        }
        
        /* Highlight Cards (Coach & Summary) */
        .highlights {
          padding: 30px 30px 10px;
          background-color: #fafbfc;
          border-bottom: 1px solid #f3f4f6;
        }
        .card { 
          border-radius: 16px; 
          padding: 24px; 
          margin-bottom: 20px; 
        }
        .card-summary { 
          background: linear-gradient(to right bottom, #f0fdf4, #dcfce7); 
          border: 1px solid #bbf7d0; 
          color: #166534;
        }
        .card-summary h2 { color: #15803d; }
        
        .card-coach { 
          background: linear-gradient(to right bottom, #fffbeb, #fef3c7); 
          border: 1px solid #fde68a; 
          color: #92400e;
        }
        .card-coach h2 { color: #b45309; }
        
        .card h2 { 
          margin: 0 0 10px 0; 
          font-size: 15px; 
          text-transform: uppercase; 
          letter-spacing: 1.5px; 
        }
        .card p { 
          margin: 0; 
          font-size: 16px; 
          line-height: 1.6;
        }
        .card-coach p { font-style: italic; font-weight: 500; }

        /* Categories & Articles */
        .news-section { padding: 20px 0 30px; }
        .category-title { 
          font-size: 22px; 
          font-weight: 800; 
          color: #111827; 
          padding: 0 30px;
          margin: 30px 0 20px; 
        }
        .article-card { 
          margin: 0 30px 25px;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .article-img { 
          width: 100%; 
          height: 220px; 
          object-fit: cover; 
          background-color: #f3f4f6; 
          display: block;
        }
        .article-content { 
          padding: 24px; 
        }
        .article-title { 
          font-size: 20px; 
          font-weight: 700; 
          margin: 0 0 12px 0; 
          color: #111827; 
          line-height: 1.3; 
        }
        .article-title a {
          color: inherit;
          text-decoration: none;
        }
        .article-summary { 
          color: #4b5563; 
          font-size: 16px; 
          margin-bottom: 20px; 
          line-height: 1.6;
        }
        .read-more { 
          display: inline-block;
          background-color: #eff6ff;
          color: #2563eb; 
          font-weight: 600; 
          font-size: 14px; 
          text-decoration: none; 
          padding: 10px 20px;
          border-radius: 8px;
        }
        
        /* Footer */
        .footer { 
          padding: 40px 30px; 
          text-align: center; 
          font-size: 13px; 
          color: #9ca3af; 
          background-color: #f9fafb; 
          border-top: 1px solid #f3f4f6; 
        }
        .footer p { margin: 5px 0; }
        .footer b { color: #6b7280; }
        
        /* Web specific for the archive page */
        .archives-link { margin-top: 15px; color: #6366f1; font-weight: bold; text-decoration: none; display: inline-block; }
        .archives-link:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div style="text-align: center; margin-bottom: 15px;">
            <a href="https://staubdevlab.github.io/daily_news_bot/" style="color: #6b7280; font-size: 13px; text-decoration: underline;">Visionner le contenu sur une page web</a>
          </div>
          <div class="header">
            <h1>🗞️ Votre Brief Matinal</h1>
            <p class="date">${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}${curatedNews.ephemeride ? ` • ${curatedNews.ephemeride}` : ''}</p>
            <div class="weather-badge">
              ${curatedNews.weather_string || `🌡️ ${curatedNews.weather_stats.temp}`} &nbsp;|&nbsp; ☀️ UV: ${curatedNews.weather_stats.uv} &nbsp;|&nbsp; 💧 ${curatedNews.weather_stats.rain}
            </div>
          </div>

          <div class="highlights">
            <div class="card card-summary">
              <h2>☕ L'essentiel du jour</h2>
              <p>${curatedNews.global_summary}</p>
            </div>
            
            <div class="card card-coach">
              <h2>🏃‍♂️ Le Conseil du Coach</h2>
              <p>"${curatedNews.running_advice}"</p>
            </div>
          </div>

          <div class="news-section">
            ${curatedNews.categories.map((cat: any) => `
              <div class="category-title">${cat.emoji} ${cat.label}</div>
              
              ${cat.articles.map((art: any) => `
                <div class="article-card">
                  ${art.image ? `<img src="${art.image}" class="article-img" alt="Illustration">` : ''}
                  <div class="article-content">
                    <h3 class="article-title">
                      <a href="${art.url}" target="_blank">${art.title}</a>
                    </h3>
                    <p class="article-summary">${art.summary}</p>
                    <a href="${art.url}" class="read-more" target="_blank">Lire l'article →</a>
                  </div>
                </div>
              `).join('')}
            `).join('')}
          </div>

          <div class="footer">
            <p>Généré avec l'Intelligence Artificielle (<b>Gemini 2.5 Flash</b>)</p>
            <p>Bordeaux, France • ${new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
