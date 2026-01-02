import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const handler: Handler = async (event: HandlerEvent, _: HandlerContext) => {
  const origin = event.headers.origin;

  const headers = {
    'Access-Control-Allow-Origin': origin ?? 'https://recomendae-filmes.netlify.app',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  // Handle preflight
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

  try {
    const API_TOKEN = process.env.API_TOKEN;

    if (!API_TOKEN) {
      throw new Error('API_TOKEN não configurado');
    }

    const response = await fetch(
      'https://api.themoviedb.org/3/genre/movie/list?language=pt-BR',
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data.genres),
    };
  } catch (error) {
    console.error('Erro ao buscar gêneros:', error);

    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Falha ao buscar gêneros',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      }),
    };
  }
};

export { handler };