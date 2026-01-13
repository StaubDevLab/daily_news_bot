import fs from 'fs';
import path from 'path';

const MONTHS = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre"
];

interface EphemerisEntry {
    jour: number;
    nom: string;
    titre: string;
}

interface EphemerisData {
    [key: string]: EphemerisEntry[];
}

export function getEphemeride(): string {
    const date = new Date();
    const day = date.getDate();
    const monthIndex = date.getMonth(); // 0 = janvier
    const monthName = MONTHS[monthIndex];
    if (!monthName) return "";

    try {
        const filePath = path.join(process.cwd(), 'ephemerid.json');
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const data: EphemerisData = JSON.parse(fileContent);

        const monthData = data[monthName];
        if (!monthData) return "";

        const entry = monthData.find(e => e.jour === day);
        if (!entry) return "";

        if (entry.titre) {
            return `${entry.titre} ${entry.nom}`;
        }
        return entry.nom;
    } catch (error) {
        console.error("Erreur lecture ephemeride:", error);
        return "";
    }
}
