import axios from 'axios';
import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';

const parser = new Parser();

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
  sport: Article[];
}

export async function fetchDailyNews(apiKey: string): Promise<DailyNews> {
  const cachePath = path.join(process.cwd(), '.news_cache.json');
  const CACHE_TTL = 3 * 60 * 60 * 1000; // 3 heures de délai de grâce

  try {
    if (fs.existsSync(cachePath)) {
      const stats = fs.statSync(cachePath);
      const isCacheValid = (new Date().getTime() - stats.mtime.getTime()) < CACHE_TTL;

      if (isCacheValid) {
        console.log("⚡ [CACHE] Utilisation des actualités en cache (économise le quota d'API !)");
        return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      } else {
        console.log("♻️ [CACHE] Le cache a expiré (> 3 heures). Récupération des nouveautés...");
      }
    }
  } catch (error) {
    console.warn("⚠️ Impossible de lire le cache, récupération forcée...");
  }

  const baseURL = 'https://newsdata.io/api/1/latest';

  const fetchFromNewsData = async (category?: string, q?: string): Promise<Article[]> => {
    try {
      const response = await axios.get(baseURL, {
        params: {
          apikey: apiKey,
          country: 'fr',
          language: 'fr',
          category: category,
          q: q,
          image: 1,
          removeduplicate: 1,
          size: 3
        }
      });

      return (response.data.results || []).map((art: any) => ({
        title: art.title || "Sans titre",
        url: art.link || "#",
        source: art.source_id || "NewsData",
        image: art.image_url
      }));
    } catch (e) {
      console.error(`Erreur NewsData (${category}):`, e);
      return [];
    }
  };

  const fetchGirondeRSS = async (): Promise<Article[]> => {
    try {
      const girondeRss = await parser.parseURL('https://www.sudouest.fr/faits-divers/rss.xml');
      return girondeRss.items.slice(0, 3).map(item => ({
        title: item.title || "Actu locale indisponible",
        url: item.link || "#",
        source: "Sud Ouest",
        image: item.enclosure?.url
      }));
    } catch (e) {
      return [];
    }
  };

  let jdgArticles: Article[] = [];
  try {
    const jdgRss = await parser.parseURL('https://www.journaldugeek.com/feed/');
    jdgArticles = jdgRss.items.slice(0, 3).map(item => ({
      title: item.title || "Actu Geek indisponible",
      url: item.link || "#",
      source: "Journal du Geek",
      image: item.enclosure?.url
    }));
  } catch (e) {
    console.error("⚠️ Erreur RSS Journal du Geek (source ignorée):", e);
  }

  const sportFeeds = [
    { url: 'https://rmcsport.bfmtv.com/rss/basket/', label: 'Basket' },
    { url: 'https://rmcsport.bfmtv.com/rss/athletisme/', label: 'Athlétisme' },
    { url: 'https://rmcsport.bfmtv.com/rss/societe/', label: 'Société' },
    { url: 'https://rmcsport.bfmtv.com/rss/jeux-olympiques/', label: 'JO' },
    { url: 'https://rmcsport.bfmtv.com/rss/rugby/', label: 'Rugby' },
    { url: 'https://rmcsport.bfmtv.com/rss/basket/nba/', label: 'NBA' }
  ];

  let sportArticles: Article[] = [];

  const fetchedFeeds = await Promise.allSettled(
    sportFeeds.map(feed => parser.parseURL(feed.url))
  );

  fetchedFeeds.forEach((result, index) => {
    const feedLabel = sportFeeds[index]?.label || 'Sport';
    if (result.status === 'fulfilled') {
      const articles = result.value.items.slice(0, 3).map(item => ({
        title: item.title || "Actu Sport indisponible",
        url: item.link || "#",
        source: `RMC Sport (${feedLabel})`,
        image: item.enclosure?.url || (item as any).mediaContent?.[0]?.url
      }));
      sportArticles = [...sportArticles, ...articles];
    } else {
      console.error(`⚠️ Erreur RSS Sport pour ${feedLabel}:`, (result as PromiseRejectedResult).reason);
    }
  });

  const dailyNews: DailyNews = {
    world: await fetchFromNewsData('world'),
    france: await fetchFromNewsData('top'),
    tech: await fetchFromNewsData('technology'),
    business: await fetchFromNewsData('business'),
    gironde: await fetchGirondeRSS(),
    jdg: jdgArticles,
    sport: sportArticles
  };

  try {
    fs.writeFileSync(cachePath, JSON.stringify(dailyNews), 'utf8');
  } catch (err) {
    console.error("⚠️ Impossible d'écrire le cache :", err);
  }

  return dailyNews;
}