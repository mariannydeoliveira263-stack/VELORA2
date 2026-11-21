export async function handler(event) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  };

  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Método não permitido." }),
    };
  }

  const urlParam = event.queryStringParameters?.url;

  if (!urlParam) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Informe o link da obra do AO3." }),
    };
  }

  let workUrl;

  try {
    workUrl = new URL(urlParam);
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Link inválido." }),
    };
  }

  if (
    !["archiveofourown.org", "www.archiveofourown.org"].includes(workUrl.hostname) ||
    !/^\/works\/\d+/.test(workUrl.pathname)
  ) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Use um link válido de uma obra do AO3." }),
    };
  }

  try {
    const response = await fetch(workUrl.href, {
      headers: {
        "User-Agent": "VeloraReader/1.0 (personal reading app)",
        "Accept": "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
          error: `O AO3 respondeu com status ${response.status}. A obra pode estar restrita ou indisponível.`,
        }),
      };
    }

    const html = await response.text();

    if (!html || !html.includes("<")) {
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
          error: "O AO3 não retornou uma página HTML válida.",
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        html,
        sourceUrl: workUrl.href,
      }),
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({
        error: "Não foi possível conectar ao AO3. Tente novamente mais tarde.",
      }),
    };
  }
}
