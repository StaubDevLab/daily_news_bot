export interface Article {
    title: string;
    url: string;
    source: string;
    image?: string;
}
export interface DailyNews {
    world: Article[];
    france: Article[];
    gironde: Article[];
    tech: Article[];
    business: Article[];
    jdg: Article[];
}
export declare function fetchDailyNews(apiKey: string): Promise<DailyNews>;
//# sourceMappingURL=news.d.ts.map