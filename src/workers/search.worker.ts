import MiniSearch from 'minisearch';

let searchEngine: MiniSearch | null = null;

self.onmessage = async (
  event: MessageEvent<{ type: 'INIT' | 'SEARCH'; indexUrl?: string; query?: string }>
) => {
  const { type, indexUrl, query } = event.data;

  if (type === 'INIT' && !searchEngine && indexUrl) {
    try {
      const res = await fetch(indexUrl);
      const json = await res.text();
      searchEngine = MiniSearch.loadJSON(json, {
        fields: ['title', 'question', 'term', 'summary', 'tags', 'domain'],
        storeFields: ['id', 'title', 'type', 'href', 'domain', 'difficulty'],
      });
      self.postMessage({ type: 'READY' });
    } catch (err: any) {
      self.postMessage({ type: 'ERROR', error: err?.message || 'Failed to initialize search engine' });
    }
  }

  if (type === 'SEARCH' && searchEngine && query !== undefined) {
    if (!query.trim()) {
      self.postMessage({ type: 'RESULTS', results: [] });
      return;
    }
    const results = searchEngine.search(query, { prefix: true, fuzzy: 0.2 }).slice(0, 30);
    self.postMessage({ type: 'RESULTS', results });
  }
};
