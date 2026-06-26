import "server-only";

const APIFY_API_BASE = "https://api.apify.com/v2";

/** Thrown when required Apify env vars are missing. Treated as a "config" error upstream. */
export class ApifyConfigError extends Error {}

/** Thrown when the Apify API itself fails (network error, non-2xx response). */
export class ApifyRequestError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
  }
}

export interface ApifyFetchOptions {
  /** How long Next.js may serve a cached response before refetching, in seconds. */
  revalidateSeconds?: number;
}

function readApifyConfig() {
  const token = process.env.APIFY_TOKEN;
  const actorId = process.env.APIFY_ACTOR_ID;
  const datasetId = process.env.APIFY_DATASET_ID;

  if (!token) {
    throw new ApifyConfigError("APIFY_TOKEN is not set.");
  }
  if (!actorId && !datasetId) {
    throw new ApifyConfigError("Set APIFY_ACTOR_ID or APIFY_DATASET_ID.");
  }

  return { token, actorId, datasetId };
}

/**
 * Fetches items from the dataset configured via env vars.
 * Prefers APIFY_DATASET_ID (a fixed dataset) when set, otherwise resolves
 * to the given actor's most recent successful run.
 */
export async function fetchLatestApifyItems<T = unknown>(
  options: ApifyFetchOptions = {}
): Promise<T[]> {
  const { token, actorId, datasetId } = readApifyConfig();
  const revalidate = options.revalidateSeconds ?? 300;

  const url = datasetId
    ? `${APIFY_API_BASE}/datasets/${encodeURIComponent(datasetId)}/items?clean=true`
    : `${APIFY_API_BASE}/acts/${encodeURIComponent(
        actorId!
      )}/runs/last/dataset/items?status=SUCCEEDED&clean=true`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate },
    });
  } catch {
    throw new ApifyRequestError("Could not reach the Apify API.");
  }

  if (!response.ok) {
    throw new ApifyRequestError(
      `Apify API responded with status ${response.status}.`,
      response.status
    );
  }

  return (await response.json()) as T[];
}
