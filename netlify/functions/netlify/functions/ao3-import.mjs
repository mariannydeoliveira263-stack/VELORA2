
export async function handler(event) {
  try {
    const url = event.queryStringParameters?.url;

    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Nenhum link do AO3 foi informado."
        })
      };
    }

    const parsedUrl = new URL(url);

    if (
      parsedUrl.hostname !== "archiveofourown.org" ||
      !/^\/works\/\d+/.test(parsedUrl.pathname)
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Link do AO3 inválido."
        })
      };
    }

    const response = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent": "VeloraReader/1.0",
        "Accept": "text/html"
      }
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: "O AO3 não conseguiu fornecer esta obra."
        })
      };
    }

    const html = await response.text();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        html,
        url: parsedUrl.toString()
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Erro ao importar a obra.",
        details: error.message
      })
    };
  }
}
