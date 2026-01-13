import axios from 'axios';

export async function fetchWeather() {
    const url = "https://api.open-meteo.com/v1/forecast";
    const params = {
        latitude: 45.0325, // Bordeaux / Margaux
        longitude: -0.6963,
        daily: ["weather_code", "temperature_2m_max", "temperature_2m_min", "sunrise", "sunset", "precipitation_probability_max", "uv_index_max"],
        timezone: "Europe/Paris",
        forecast_days: 1
    };

    try {
        const response = await axios.get(url, { params });
        const daily = response.data.daily;

        return {
            maxTemp: daily.temperature_2m_max[0],
            minTemp: daily.temperature_2m_min[0],
            rainProb: daily.precipitation_probability_max[0],
            sunrise: daily.sunrise[0].split('T')[1],
            sunset: daily.sunset[0].split('T')[1],
            code: daily.weather_code[0]
        };
    } catch (error) {
        console.error("Erreur Météo:", error);
        return null;
    }
}