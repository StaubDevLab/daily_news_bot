// Types partagés pour l'ensemble de l'application DailyBrief

export interface WeatherData {
    maxTemp: number;
    minTemp: number;
    rainProb: number;
    uvIndex: number;
    sunrise: string;
    sunset: string;
    code: number;
    weatherInfo: { label: string; emoji: string };
}

export interface CuratedArticle {
    title: string;
    summary: string;
    url: string;
    image?: string;
}

export interface CuratedCategory {
    label: string;
    emoji: string;
    articles: CuratedArticle[];
}

export interface CuratedNews {
    ephemeride: string;
    global_summary: string;
    running_advice: string;
    weather_string: string;
    weather_stats: {
        temp: string;
        rain: string;
        uv: string;
    };
    categories: CuratedCategory[];
}
