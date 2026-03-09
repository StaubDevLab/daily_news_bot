import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import { CuratedNews } from '../types';
import { generateHtml } from './template';

export async function sendDailyEmail(curatedNews: CuratedNews) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const htmlContent = generateHtml(curatedNews);

  let recipients: string[] = [];

  // Lecture des abonnés depuis le fichier
  try {
    const subscribersPath = path.join(process.cwd(), 'subscribers.json');
    if (fs.existsSync(subscribersPath)) {
      const fileData = fs.readFileSync(subscribersPath, 'utf8');
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        recipients = parsed;
      }
    }
  } catch (error) {
    console.error("⚠️ Erreur lors de la lecture de subscribers.json :", error);
  }

  // Fallback sur la variable d'environnement si le fichier est vide ou absent
  if (recipients.length === 0 && process.env.MY_EMAIL) {
    recipients = [process.env.MY_EMAIL];
  }

  if (recipients.length === 0) {
    console.warn("⚠️ Aucun destinataire trouvé pour l'email.");
    return;
  }

  console.log(`📧 Envoi de l'email à ${recipients.length} destinataire(s)...`);

  // Envoi à chaque destinataire de manière isolée pour la confidentialité
  const emailPromises = recipients.map(email =>
    resend.emails.send({
      from: 'DailyBrief <onboarding@resend.dev>',
      to: email,
      subject: `🗞️ Votre Brief : ${new Date().toLocaleDateString('fr-FR')}`,
      html: htmlContent,
    })
  );

  try {
    await Promise.all(emailPromises);
    console.log("✅ Tous les emails ont été envoyés avec succès !");
  } catch (err) {
    console.error("❌ Erreur lors de l'envoi des emails:", err);
  }
}