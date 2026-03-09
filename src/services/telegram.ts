import axios from 'axios';
import { CuratedNews } from '../types';

// Échappe les caractères spéciaux HTML pour le mode parse_mode: 'HTML' de Telegram
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

export async function sendTelegramMessage(curatedNews: CuratedNews) {
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
        message += `☕ <b>L'ESSENTIEL :</b>\n<i>${escapeHtml(curatedNews.global_summary)}</i>\n\n`;
    }
    if (curatedNews.running_advice) {
        message += `🏃‍♂️ <b>COACH RUNNING :</b>\n<i>${escapeHtml(curatedNews.running_advice)}</i>\n\n`;
    }
    if (curatedNews.weather_string) {
        message += `🌡️ <b>MÉTÉO :</b> ${escapeHtml(curatedNews.weather_string)}\n\n`;
    }
    // 3. Boucle sur les catégories
    let isTruncated = false;
    for (const cat of curatedNews.categories) {
        if (isTruncated) break;

        let catBlock = `${cat.emoji} <b>${cat.label.toUpperCase()}</b>\n`;
        let addedArticles = 0;

        for (const art of cat.articles) {
            const cleanTitle = escapeHtml(art.title || "");
            const cleanUrl = escapeHtml(art.url || "#");
            const articleLine = `• <a href="${cleanUrl}">${cleanTitle}</a>\n`;

            // Si on ajoute cette ligne, est-ce qu'on dépasse ~3900 caractères ? (on garde de la marge pour le footer)
            if (message.length + catBlock.length + articleLine.length > 3900) {
                isTruncated = true;
                break;
            }

            catBlock += articleLine;
            addedArticles++;
        }

        if (addedArticles > 0) {
            message += catBlock + `\n`; // Espace entre les catégories
        }
    }

    if (isTruncated) {
        message += `✉️ <i>Message tronqué (limite Telegram atteinte). Suite dans votre email !</i>`;
    } else {
        message += `✉️ <i>Détails et résumés complets dans votre email.</i>`;
    }

    // 4. Envoi unique
    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML',
            disable_web_page_preview: true
        });
        console.log("📱 Message unique Telegram envoyé !");
    } catch (error: any) {
        if (error.response?.data?.description?.includes("too long")) {
            console.error("❌ Le message est trop long pour Telegram (> 4096 caractères).");
        } else {
            console.error("❌ Erreur Telegram:", error.response?.data?.description || error.message);
        }
    }
}