import axios from 'axios';

export async function sendTelegramMessage(curatedNews: any) {
    const token = process.env.TELEGRAM_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
        console.error("❌ Variables Telegram manquantes");
        return;
    }

    // 1. On boucle sur les articles pour envoyer les visuels
    for (const cat of curatedNews.categories) {
        for (const art of cat.articles) {
            // Nettoyage rigoureux des caractères HTML pour éviter les erreurs 400
            const cleanTitle = (art.title || "").replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const cleanSummary = (art.summary || "").replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

            const caption = `<b>${cat.emoji} ${cat.label.toUpperCase()}</b>\n\n` +
                `<a href="${art.url}">${cleanTitle}</a>\n\n` +
                `<i>${cleanSummary}</i>`;

            try {
                if (art.image && art.image.startsWith('http')) {
                    await axios.post(`https://api.telegram.org/bot${token}/sendPhoto`, {
                        chat_id: chatId,
                        photo: art.image,
                        caption: caption,
                        parse_mode: 'HTML'
                    });
                } else {
                    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
                        chat_id: chatId,
                        text: caption,
                        parse_mode: 'HTML',
                        disable_web_page_preview: false
                    });
                }

                // Délai pour respecter les limites de l'API Telegram
                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (error: any) {
                console.error(`❌ Erreur Telegram pour "${art.title}":`, error.response?.data?.description || error.message);
            }
        }
    }

    // 2. Envoi du résumé global à la toute fin (Conclusion)
    if (curatedNews.global_summary) {
        try {
            const cleanGlobal = curatedNews.global_summary.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const finalMessage = `☕ <b>L'ESSENTIEL À RETENIR :</b>\n\n<i>${cleanGlobal}</i>\n\n👋 <i>À demain pour de nouvelles actus !</i>`;

            await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
                chat_id: chatId,
                text: finalMessage,
                parse_mode: 'HTML'
            });
            console.log("📱 Résumé global Telegram envoyé !");
        } catch (error: any) {
            console.error("❌ Erreur lors de l'envoi du résumé final Telegram");
        }
    }
}