"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const news_1 = require("./services/news");
const mail_1 = require("./services/mail");
const telegram_1 = require("./services/telegram");
const generative_ai_1 = require("@google/generative-ai");
const weather_1 = require("./services/weather");
const ephemeris_1 = require("./services/ephemeris");
dotenv_1.default.config();
async function main() {
    try {
        // 1. Fetch
        const rawNews = await (0, news_1.fetchDailyNews)(process.env.NEWSDATA_API_KEY);
        const weather = await (0, weather_1.fetchWeather)();
        const ephemeride = (0, ephemeris_1.getEphemeride)();
        // 2. IA Curation (Modèle 2.0 Flash)
        const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `
  Tu es un rédacteur en chef d'une newsletter premium et un coach sportif motivant. 
  Voici une liste d'actualités brutes par catégories : ${JSON.stringify(rawNews)}.
  Et voici les infos météo détaillées : ${JSON.stringify(weather)}.
  Aujourd'hui, nous fêtons : ${ephemeride}.
  
  TES MISSIONS :
  1. RÉSUMÉ GLOBAL : Rédige deux paragraphes (10 phrases maximum au total) qui synthétisent l'ambiance et les enjeux majeurs de l'actualité de ce jour. Appelle ce champ "global_summary".
  
  2. CONSEIL RUNNING : En fonction de la météo (température de ${weather?.minTemp}°C à ${weather?.maxTemp}°C, ciel: ${weather?.weatherInfo.label}, pluie: ${weather?.rainProb}%), dis-moi si c'est une bonne journée pour courir et quelle est l'heure idéale entre le lever du soleil (${weather?.sunrise}) et son coucher (${weather?.sunset}). Sois motivant et précis ! Appelle ce champ "running_advice".
  
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
      "rain": "${weather?.rainProb}%" 
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
        const curatedNews = JSON.parse(jsonMatch[0]);
        curatedNews.ephemeride = ephemeride;
        // 3. Distribution
        await Promise.all([
            (0, mail_1.sendDailyEmail)(curatedNews),
            (0, telegram_1.sendTelegramMessage)(curatedNews)
        ]);
        console.log("✅ Tout est envoyé. Fin du processus.");
        process.exit(0); // Optionnel : force la sortie propre
    }
    catch (error) {
        console.error("💥 Erreur critique:", error);
        process.exit(1); // Indique à GitHub Actions que le job a échoué
    }
}
main();
//# sourceMappingURL=index.js.map