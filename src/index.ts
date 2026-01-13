import dotenv from 'dotenv';
import { fetchDailyNews } from './services/news';
import { sendDailyEmail } from './services/mail';
import { sendTelegramMessage } from './services/telegram';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchWeather } from './services/weather';
dotenv.config();

async function main() {
  try {
    // 1. Fetch
    const rawNews = await fetchDailyNews(process.env.NEWSDATA_API_KEY!);
    const weather = await fetchWeather();

    // 2. IA Curation (Modèle 2.0 Flash)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
  Tu es un rédacteur en chef d'une newsletter premium. 
  Voici une liste d'actualités brutes par catégories : ${JSON.stringify(rawNews)}.
  Et voici les infos météo : ${JSON.stringify(weather)}.
  
  TES MISSIONS :
  1. RÉSUMÉ GLOBAL : Rédige deux paragraphes de 10 phrases maximum qui synthétise l'ambiance et les enjeux majeurs de l'actualité de ce jour. Appelle ce champ "global_summary".
  2. CONSEIL RUNNING : En fonction de la météo (température, pluie), dis-moi si c'est une bonne journée pour courir et quelle est l'heure idéale (entre le lever ${weather?.sunrise} et le coucher du soleil ${weather?.sunset}). Sois motivant ! Appelle ce champ "running_advice".
  3. Sélectionne les 3 articles les plus marquants par catégorie.
  4. DÉDUPLICATION : Un même événement ne doit pas apparaître deux fois dans le JSON final.
  5. CONSERVATION DES DONNÉES : Pour chaque article, tu DOIS impérativement conserver l'URL originale ("url") et l'URL de l'image ("image"). Ne les invente pas, recopie-les fidèlement.
  6. RÉDACTION : Rédige un titre court (max 10 mots) et une phrase de résumé percutante (max 20 mots).
  7. STYLE : Utilise un ton professionnel mais dynamique.

  Réponds UNIQUEMENT en JSON sous ce format strict :
  {
    "global_summary": "...",
    "running_advice": "...",
   "weather_stats": { "temp": "${weather?.maxTemp}°C", "rain": "${weather?.rainProb}%" },
    "categories": [
      { 
        "label": "Monde", 
        "emoji": "🌍", 
        "articles": [
          { "title": "...", "summary": "...", "url": "...", "image": "..." },
          { "title": "...", "summary": "...", "url": "...", "image": "..." },
          { "title": "...", "summary": "...", "url": "...", "image": "..." }
        ]
      },
      ... (répéter pour France, Gironde, Tech, Business, Journal du Geek)
    ]
  }
`;

    const result = await model.generateContent(prompt);
    const curatedNews = JSON.parse(result.response.text().replace(/```json|```/g, ""));

    // 3. Distribution
    await Promise.all([
      sendDailyEmail(curatedNews),
      sendTelegramMessage(curatedNews)
    ]);

    console.log("✅ Tout est envoyé. Fin du processus.");
    process.exit(0); // Optionnel : force la sortie propre
  } catch (error) {
    console.error("💥 Erreur critique:", error);
    process.exit(1); // Indique à GitHub Actions que le job a échoué
  }
}

main();