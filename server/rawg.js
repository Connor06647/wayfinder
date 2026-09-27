function isGtaSearch(search) {
  return search === 'gta' || search === 'grand theft auto' || search.includes('gta 6') || search.includes('gta vi')
}

export async function handleGamesRequest(req, res) {
  const apiKey = process.env.RAWG_API_KEY
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined
  const genres = typeof req.query.genres === 'string' ? req.query.genres.trim() : undefined
  const tags = typeof req.query.tags === 'string' ? req.query.tags.trim() : undefined

  if (!apiKey) {
    res.status(503).json({ message: 'RAWG_API_KEY is not configured.' })
    return
  }
  if (!search && !genres && !tags) {
    res.status(400).json({ message: 'A search term is required.' })
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
      res.status(200).type('application/json').send(await rawgResponse.text())
      return
    }

    const normalizedSearch = search.toLowerCase()
    const isGtaQuery = isGtaSearch(normalizedSearch)
    const searchTerms = isGtaQuery ? ['Grand Theft Auto', 'GTA'] : [search]
    const rawgResponses = await Promise.all(
      searchTerms.map(async (term) => {
        const rawgUrl = new URL('https://api.rawg.io/api/games')
        rawgUrl.searchParams.set('key', apiKey)
        rawgUrl.searchParams.set('search', term)
        rawgUrl.searchParams.set('page_size', '40')
        if (normalizedSearch.includes('gta') || normalizedSearch.includes('fifa')) rawgUrl.searchParams.set('ordering', '-released')
        const rawgResponse = await fetch(rawgUrl)
        if (!rawgResponse.ok) throw new Error(`RAWG returned ${rawgResponse.status}`)
        return await rawgResponse.json()
      }),
    )
    const mergedResults = [...new Map(rawgResponses.flatMap((result) => result.results ?? []).map((game) => [String(game.id), game])).values()]
    res.status(200).json({ results: mergedResults })
  } catch {
    res.status(502).json({ message: 'RAWG could not be reached.' })
  }
}
