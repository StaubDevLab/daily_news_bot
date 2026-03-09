import dotenv from 'dotenv';
import { fetchDailyNews } from './services/news';
import { sendDailyEmail } from './services/mail';
import { sendTelegramMessage } from './services/telegram';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchWeather } from './services/weather';
import { getEphemeride } from './services/ephemeris';
import { CuratedNews } from './types';
dotenv.config();

async function main() {
  try {
    // 1. Fetch
    const rawNews = await fetchDailyNews(process.env.NEWSDATA_API_KEY!);
    const weather = await fetchWeather();
    const ephemeride = getEphemeride();

    // 2. IA Curation (Modèle 2.0 Flash)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
  Tu es un rédacteur en chef d'une newsletter premium et un coach sportif motivant. 
  Voici une liste d'actualités brutes par catégories : ${JSON.stringify(rawNews)}.
  Et voici les infos météo détaillées : ${JSON.stringify(weather)}.
  Aujourd'hui, nous fêtons : ${ephemeride}.
  
  TES MISSIONS :
  1. RÉSUMÉ GLOBAL : Rédige deux paragraphes (10 phrases maximum au total) qui synthétisent l'ambiance et les enjeux majeurs de l'actualité de ce jour. Appelle ce champ "global_summary".
  
  2. CONSEIL RUNNING : En fonction de la météo (température de ${weather?.minTemp}°C à ${weather?.maxTemp}°C, ciel: ${weather?.weatherInfo.label}, pluie: ${weather?.rainProb}%, indice UV: ${weather?.uvIndex}), dis-moi si c'est une bonne journée pour courir et quelle est l'heure idéale entre le lever du soleil (${weather?.sunrise}) et son coucher (${weather?.sunset}). Si l'indice UV est élevé (> 3), recommande une protection solaire. Sois motivant et précis ! Appelle ce champ "running_advice".
  
  3. SÉLECTION & DÉDUPLICATION : Sélectionne les 3 articles les plus marquants par catégorie. Un même événement ne doit pas apparaître deux fois dans le JSON final, choisis la catégorie la plus pertinente.
  
  4. CONSERVATION DES DONNÉES : Pour chaque article, tu DOIS impérativement conserver l'URL originale ("url") et l'URL de l'image ("image"). Ne les invente pas, recopie-les fidèlement.
  
  5. RÉDACTION : Rédige un titre court (max 10 mots) et une phrase de résumé percutante (max 20 mots) par article.
  
  6. STYLE : Utilise un ton professionnel, dynamique et engageant.

  Réponds UNIQUEMENT en JSON sous ce format strict :
  {
    "ephemeride": "${ephemeride}",
    "global_summary": "...",
    "running_advice": "...",
    "weather_string": "${weather?.weatherInfo?.emoji} ${weather?.weatherInfo?.label} (${weather?.minTemp}°C / ${weather?.maxTemp}°C)",
    "weather_stats": { 
      "temp": "${weather?.maxTemp}°C", 
      "rain": "${weather?.rainProb}%",
      "uv": "${weather?.uvIndex}"
    },
    "categories": [
      { 
        "label": "Monde", 
        "emoji": "🌍", 
        "articles": [
          { "title": "...", "summary": "...", "url": "...", "image": "..." }
        ]
      }
    ]
  }
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extraction plus robuste du JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("❌ Pas de JSON trouvé dans la réponse:", responseText);
      throw new Error("Format de réponse invalide");
    }

    const curatedNews: CuratedNews = JSON.parse(jsonMatch[0]);
    curatedNews.ephemeride = ephemeride;

    // Validation de la structure retournée par Gemini
    if (!curatedNews.categories || !Array.isArray(curatedNews.categories)) {
      throw new Error("La réponse Gemini ne contient pas de catégories valides.");
    }
    if (!curatedNews.global_summary || !curatedNews.running_advice || !curatedNews.weather_stats?.uv) {
      throw new Error("La réponse Gemini est incomplète (champs manquants).");
    }
    console.log(`✅ Réponse Gemini validée : ${curatedNews.categories.length} catégorie(s).`);

    // 3. Distribution
    await Promise.all([
      sendDailyEmail(curatedNews),
      sendTelegramMessage(curatedNews)
    ]);

    console.log("✅ Tout est envoyé. Fin du processus.");
    process.exit(0);
  } catch (error) {
    console.error("💥 Erreur critique:", error);
    try {
      const axios = (await import('axios')).default;
      await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: `💥 <b>DailyBrief a échoué !</b>\n\n<code>${String(error).substring(0, 500)}</code>`,
        parse_mode: 'HTML'
      });
    } catch {
      // Ignorer
    }
    process.exit(1);
  }
}

main();