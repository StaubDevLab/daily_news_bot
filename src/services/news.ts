import axios from 'axios';
import Parser from 'rss-parser';

const parser = new Parser();

export interface Article {
  title: string;
  url: string;
  source: string;
  image?: string;
}

// Chaque catégorie est maintenant un tableau d'articles
export interface DailyNews {
  world: Article[];
  france: Article[];
  gironde: Article[];
  tech: Article[];
  business: Article[];
  jdg: Article[];
}

export async function fetchDailyNews(apiKey: string): Promise<DailyNews> {
  const baseURL = 'https://newsdata.io/api/1/latest';

  const fetchFromNewsData = async (category?: string, q?: string): Promise<Article[]> => {
    try {
      const response = await axios.get(baseURL, {
        params: {
          apikey: apiKey,
          country: 'fr',
          language: 'fr',
          category: category, // ex: 'technology', 'business', 'world'
          q: q,
          image: 1,
          removeduplicate: 1,
          size: 3 // On demande directement 3 articles
        }
      });

      return (response.data.results || []).map((art: any) => ({
        title: art.title || "Sans titre",
        url: art.link || "#", // NewsData utilise 'link'
        source: art.source_id || "NewsData",
        image: art.image_url
      }));
    } catch (e) {
      console.error(`Erreur NewsData (${category}):`, e);
      return [];
    }
  };

  // 🍷 Cas particulier pour la Gironde via RSS (on prend les 3 premiers)
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
  const jdgRss = await parser.parseURL('https://www.journaldugeek.com/feed/');
  const jdgArticles = jdgRss.items.slice(0, 3).map(item => ({
    title: item.title || "Actu Geek indisponible",
    url: item.link || "#",
    source: "Journal du Geek",
    image: item.enclosure?.url
  }));

  return {
    world: await fetchFromNewsData('world'),
    france: await fetchFromNewsData('top'), // 'top' est souvent mieux pour l'actu générale France
    tech: await fetchFromNewsData('technology'),
    business: await fetchFromNewsData('business'),
    gironde: await fetchGirondeRSS(),
    jdg: jdgArticles
  };
}