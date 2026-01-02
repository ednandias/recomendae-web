import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

interface MovieResponse {
  title: string;
  overview: string;
  release_date: string;
  poster_path: string;
  vote_average: number;
}

interface DiscoverResponse {
  results: Array<{ id: number }>;
  total_pages: number;
}

interface ProviderResponse {
  results?: {
    BR?: {
      flatrate?: Array<{ logo_path: string;[key: string]: unknown }>;
      rent?: Array<{ logo_path: string;[key: string]: unknown }>;
      buy?: Array<{ logo_path: string;[key: string]: unknown }>;
    };
  };
}

const handler: Handler = async (event: HandlerEvent, _: HandlerContext) => {
  const origin = event.headers.origin;

  const headers = {
    'Access-Control-Allow-Origin': origin ?? 'https://recomendae-filmes.netlify.app',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const fetchJson = async <T>(url: string, headers: HeadersInit): Promise<T> => {
    const res = await fetch(url, { headers });

    if (!res.ok) {
      throw new Error(`TMDB error ${res.status}`);
    }

    return res.json();
  };

  try {
    const API_TOKEN = process.env.API_TOKEN;

    if (!API_TOKEN) {
      throw new Error('API_TOKEN não configurado');
    }

    const genreId = event.queryStringParameters?.genreId;
    const deepSearch = event.queryStringParameters?.deepSearch || 'no';

    if (!genreId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'genreId é obrigatório' }),
      };
    }

    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_TOKEN}`,
    };

    // Helper function para construir URL com params
    const buildUrl = (path: string, params: Record<string, unknown>) => {
      const url = new URL(`https://api.themoviedb.org/3${path}`);

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });

      return url.toString();
    };

    const pad = (n: number) => String(n).padStart(2, '0');

    // Data atual
    const date = new Date();
    const currentDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

    // Limite padrão para evitar chamadas extras à API
    let numberOfPages = 10;

    if (deepSearch === 'yes') {
      const discoverUrl = buildUrl('/discover/movie', {
        language: 'pt-BR',
        with_genres: genreId,
        'primary_release_date.gte': '1980-01-01',
        'primary_release_date.lte': currentDate,
        sort_by: 'popularity.desc',
        'vote_count.gte': '100',
      });

      const discoverData = await fetchJson<DiscoverResponse>(discoverUrl, authHeaders)
      numberOfPages = Math.min(discoverData.total_pages, 500);
    }

    // Selecionar página aleatória
    const page = Math.floor(Math.random() * numberOfPages) + 1;

    // Buscar filmes
    const moviesUrl = buildUrl('/discover/movie', {
      language: 'pt-BR',
      with_genres: genreId,
      'primary_release_date.gte': '1980-01-01',
      'primary_release_date.lte': currentDate,
      sort_by: 'popularity.desc',
      'vote_count.gte': '100',
      page: page,
    });

    const moviesData = await fetchJson<DiscoverResponse>(moviesUrl, authHeaders)

    if (!moviesData.results || moviesData.results.length === 0) {
      throw new Error('Nenhum filme encontrado');
    }

    // Selecionar filme aleatório
    const randomMovie = moviesData.results[
      Math.floor(Math.random() * moviesData.results.length)
    ];

    // Buscar detalhes do filme
    const movieUrl = buildUrl(`/movie/${randomMovie.id}`, {
      language: 'pt-BR',
    });

    const movieData = await fetchJson<MovieResponse>(movieUrl, authHeaders)

    // Buscar provedores
    const providersUrl = `https://api.themoviedb.org/3/movie/${randomMovie.id}/watch/providers`;
    const providersData = await fetchJson<ProviderResponse>(providersUrl, authHeaders)

    // Montar resposta final
    const result = {
      title: movieData.title,
      synopsis: movieData.overview,
      release_date: movieData.release_date,
      poster: `https://image.tmdb.org/t/p/w500${movieData.poster_path}`,
      rating: movieData.vote_average,
      streaming:
        providersData.results?.BR?.flatrate?.map((streaming) => ({
          ...streaming,
          logo_path: `https://image.tmdb.org/t/p/w92${streaming.logo_path}`,
        })) || [],
      rent:
        providersData.results?.BR?.rent?.map((rent) => ({
          ...rent,
          logo_path: `https://image.tmdb.org/t/p/w92${rent.logo_path}`,
        })) || [],
      buy:
        providersData.results?.BR?.buy?.map((buy) => ({
          ...buy,
          logo_path: `https://image.tmdb.org/t/p/w92${buy.logo_path}`,
        })) || [],
    };

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Erro ao recomendar filme:', error);

    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Falha ao recomendar filme',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      }),
    };
  }
};

export { handler };