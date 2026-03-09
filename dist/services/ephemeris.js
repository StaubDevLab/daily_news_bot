"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEphemeride = getEphemeride;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const MONTHS = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre"
];
function getEphemeride() {
    const date = new Date();
    const day = date.getDate();
    const monthIndex = date.getMonth(); // 0 = janvier
    const monthName = MONTHS[monthIndex];
    if (!monthName)
        return "";
    try {
        const filePath = path_1.default.join(process.cwd(), 'ephemerid.json');
        const fileContent = fs_1.default.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(fileContent);
        const monthData = data[monthName];
        if (!monthData)
            return "";
        const entry = monthData.find(e => e.jour === day);
        if (!entry)
            return "";
        if (entry.titre) {
            return `${entry.titre} ${entry.nom}`;
        }
        return entry.nom;
    }
    catch (error) {
        console.error("Erreur lecture ephemeride:", error);
        return "";
    }
}
//# sourceMappingURL=ephemeris.js.map