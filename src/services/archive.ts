import fs from 'fs';
import path from 'path';
import { CuratedNews } from '../types';
import { generateHtml } from './template';

export function saveArchiveAndGenerateWebsite(curatedNews: CuratedNews) {
    try {
        const docsDir = path.join(process.cwd(), 'docs');
        const archivesDir = path.join(docsDir, 'archives');

        // 1. Création des dossiers si nécessaires
        if (!fs.existsSync(docsDir)) {
            fs.mkdirSync(docsDir, { recursive: true });
        }
        if (!fs.existsSync(archivesDir)) {
            fs.mkdirSync(archivesDir, { recursive: true });
        }

        const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const htmlContent = generateHtml(curatedNews);

        // 2. Sauvegarde des archives (JSON et HTML)
        const jsonArchivePath = path.join(archivesDir, `${dateStr}.json`);
        const htmlArchivePath = path.join(archivesDir, `${dateStr}.html`);

        fs.writeFileSync(jsonArchivePath, JSON.stringify(curatedNews, null, 2), 'utf8');
        fs.writeFileSync(htmlArchivePath, htmlContent, 'utf8');

        // 3. Génération du site web statique (index.html pointant toujours sur le dernier brief)
        const indexPath = path.join(docsDir, 'index.html');

        // On peut pimper l'index avec un lien vers les archives
        const modifiedHtml = htmlContent.replace(
            '<div class="footer">',
            `<div class="footer">
          <a href="./archives/${dateStr}.html" class="archives-link">Permalien de l'édition du jour</a><br>
          <a href="https://github.com/StaubDevLab/daily_news_bot/tree/main/docs/archives" class="archives-link">Accéder à toutes les archives</a><br><br>`
        );

        fs.writeFileSync(indexPath, modifiedHtml, 'utf8');

        console.log(`🌐 Site Web et archives mis à jour pour le ${dateStr}`);
    } catch (error) {
        console.error("❌ Erreur lors de l'archivage et de la génération du site :", error);
    }
}
