"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTelegramMessage = sendTelegramMessage;
const axios_1 = __importDefault(require("axios"));
async function sendTelegramMessage(curatedNews) {
    const token = process.env.TELEGRAM_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) {
        console.error("❌ Variables Telegram manquantes");
        return;
    }
    // 1. Construction du message unique
    let message = `<b>🗞️ VOTRE BRIEF DU MATIN</b>\n`;
    const dateStr = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    message += `📅 <b>${dateStr}</b>${curatedNews.ephemeride ? ` • ${curatedNews.ephemeride}` : ''}\n\n`;
    // 2. Ajout du résumé global en haut pour le "TL;DR"
    if (curatedNews.global_summary) {
        const cleanGlobal = curatedNews.global_summary
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        message += `☕ <b>L'ESSENTIEL :</b>\n<i>${cleanGlobal}</i>\n\n`;
    }
    if (curatedNews.running_advice) {
        message += `🏃‍♂️ <b>COACH RUNNING :</b>\n<i>${curatedNews.running_advice}</i>\n\n`;
    }
    if (curatedNews.weather_string) {
        message += `🌡️ <b>MÉTÉO :</b> ${curatedNews.weather_string}\n\n`;
    }
    // 3. Boucle sur les catégories
    for (const cat of curatedNews.categories) {
        message += `${cat.emoji} <b>${cat.label.toUpperCase()}</b>\n`;
        for (const art of cat.articles) {
            const cleanTitle = (art.title || "").replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            // On utilise une puce pour chaque article avec le lien intégré
            message += `• <a href="${art.url}">${cleanTitle}</a>\n`;
        }
        message += `\n`; // Espace entre les catégories
    }
    message += `✉️ <i>Détails et résumés complets dans votre email.</i>`;
    // 4. Envoi unique
    try {
        await axios_1.default.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML',
            disable_web_page_preview: true // On désactive pour éviter d'avoir 15 aperçus de liens
        });
        console.log("📱 Message unique Telegram envoyé !");
    }
    catch (error) {
        if (error.response?.data?.description?.includes("too long")) {
            console.error("❌ Le message est trop long pour Telegram (> 4096 caractères).");
        }
        else {
            console.error("❌ Erreur Telegram:", error.response?.data?.description || error.message);
        }
    }
}
//# sourceMappingURL=telegram.js.map