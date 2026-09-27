import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

function rawgProxy(apiKey: string): Plugin {
  return {
    name: 'rawg-proxy',
    configureServer(server) {
      server.middlewares.use('/api/games', async (request, response) => {
        if (!apiKey || !request.url) {
          response.statusCode = 503
          response.end(JSON.stringify({ message: 'RAWG_API_KEY is not configured.' }))
          return
        }

        const requestUrl = new URL(request.url, 'http://localhost')
        const search = requestUrl.searchParams.get('search')?.trim()
        const genres = requestUrl.searchParams.get('genres')?.trim()
        const tags = requestUrl.searchParams.get('tags')?.trim()
        if (!search && !genres && !tags) {
          response.statusCode = 400
          response.end(JSON.stringify({ message: 'A search term is required.' }))
          return
        }

        try {
          if (!search) {
            const rawgUrl = new URL('https://api.rawg.io/api/games')
            rawgUrl.searchParams.set('key', apiKey)
            if (genres) rawgUrl.searchParams.set('genres', genres)
            if (tags) rawgUrl.searchParams.set('tags', tags)
            rawgUrl.searchParams.set('ordering', '-rating')
            rawgUrl.searchParams.set('page_size', '20')
            const rawgResponse = await fetch(rawgUrl)
            if (!rawgResponse.ok) throw new Error(`RAWG returned ${rawgResponse.status}`)
            response.statusCode = 200
            response.setHeader('Content-Type', 'application/json')
            response.end(await rawgResponse.text())
            return
          }

          const normalizedSearch = search.toLowerCase()
          const isGtaQuery = normalizedSearch === 'gta' || normalizedSearch.includes('gta 6') || normalizedSearch.includes('gta vi')
          const searchTerms = isGtaQuery ? ['Grand Theft Auto', 'GTA'] : [search]
          const rawgResponses = await Promise.all(searchTerms.map(async (term) => {
            const rawgUrl = new URL('https://api.rawg.io/api/games')
            rawgUrl.searchParams.set('key', apiKey)
            rawgUrl.searchParams.set('search', term)
            rawgUrl.searchParams.set('page_size', '40')
            if (normalizedSearch.includes('gta') || normalizedSearch.includes('fifa')) rawgUrl.searchParams.set('ordering', '-released')
            const rawgResponse = await fetch(rawgUrl)
            if (!rawgResponse.ok) throw new Error(`RAWG returned ${rawgResponse.status}`)
            return await rawgResponse.json() as { results?: unknown[] }
          }))
          const mergedResults = [...new Map(rawgResponses.flatMap((result) => result.results ?? []).map((game) => [String((game as { id: number }).id), game])).values()]
          response.statusCode = 200
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ results: mergedResults }))
        } catch {
          response.statusCode = 502
          response.end(JSON.stringify({ message: 'RAWG could not be reached.' }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), rawgProxy(env.RAWG_API_KEY)],
  }
})
