"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchWeather = fetchWeather;
const axios_1 = __importDefault(require("axios"));
function interpretWeatherCode(code) {
    if (code === 0)
        return { label: "Ciel dégagé", emoji: "☀️" };
    if (code <= 3)
        return { label: "Peu nuageux", emoji: "🌤️" };
    if (code <= 48)
        return { label: "Brouillard", emoji: "🌫️" };
    if (code <= 55)
        return { label: "Bruine légère", emoji: "🌦️" };
    if (code <= 65)
        return { label: "Pluie", emoji: "🌧️" };
    if (code <= 82)
        return { label: "Averses", emoji: "🌦️" };
    return { label: "Orageux", emoji: "⚡" };
}
async function fetchWeather() {
    const url = "https://api.open-meteo.com/v1/forecast";
    const params = {
        latitude: process.env.LATITUDE || "44.833328",
        longitude: process.env.LONGITUDE || "-0.56667",
        daily: ["weather_code", "temperature_2m_max", "temperature_2m_min", "sunrise", "sunset", "precipitation_probability_max", "uv_index_max"],
        timezone: "Europe/Paris",
        forecast_days: 1
    };
    try {
        const response = await axios_1.default.get(url, { params });
        const daily = response.data.daily;
        const weatherInfo = interpretWeatherCode(daily.weather_code[0]);
        return {
            maxTemp: daily.temperature_2m_max[0],
            minTemp: daily.temperature_2m_min[0],
            rainProb: daily.precipitation_probability_max[0],
            sunrise: daily.sunrise[0].split('T')[1],
            sunset: daily.sunset[0].split('T')[1],
            code: daily.weather_code[0],
            weatherInfo: weatherInfo
        };
    }
    catch (error) {
        console.error("Erreur Météo:", error);
        return null;
    }
}
//# sourceMappingURL=weather.js.map