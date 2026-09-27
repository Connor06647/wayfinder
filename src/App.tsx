import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react'
import './App.css'

type Game = {
  id: number
  title: string
  genre: string
  reason: string
  match: number
  image: string
  platforms: string
  meta: string
  rating: number
  genreSlugs: string[]
  tagSlugs: string[]
}

type LibraryEntry = {
  id: number
  title: string
  status: 'Completed' | 'Playing' | 'Want to play' | 'Dropped'
  image: string
  rating: number | null
  review: string
  updated: string
  genreSlugs: string[]
  tagSlugs: string[]
}

const games: Game[] = [
  { id: 1, title: 'Sea of Stars', genre: 'Turn-based RPG', reason: 'Shares the hand-crafted world-building and party-based combat you love in Octopath Traveler.', match: 94, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1244090/header.jpg', platforms: 'PC · Switch · PS5', meta: '2023 · Sabotage Studio', rating: 4.8, genreSlugs: ['rpg', 'indie'], tagSlugs: ['turn-based-combat', 'story-rich', 'singleplayer'] },
  { id: 2, title: 'Dredge', genre: 'Atmospheric adventure', reason: 'Combines the quiet exploration of Subnautica with a darker, discovery-first loop.', match: 89, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1562430/header.jpg', platforms: 'PC · Xbox · PS5 · Switch', meta: '2023 · Black Salt Games', rating: 4.5, genreSlugs: ['adventure', 'indie'], tagSlugs: ['atmospheric', 'survival', 'exploration'] },
  { id: 3, title: 'Tunic', genre: 'Action adventure', reason: 'A compact, mysterious world for players who enjoy discovery without hand-holding.', match: 86, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/553420/header.jpg', platforms: 'PC · Xbox · PlayStation', meta: '2022 · Isometricorp Games', rating: 4.5, genreSlugs: ['action', 'adventure', 'indie'], tagSlugs: ['exploration', 'difficult', 'atmospheric'] },
  { id: 4, title: 'Pentiment', genre: 'Narrative mystery', reason: 'Connects with your interest in story-rich worlds where every choice leaves a mark.', match: 82, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1205520/header.jpg', platforms: 'PC · Xbox · Switch', meta: '2022 · Obsidian Entertainment', rating: 4.4, genreSlugs: ['rpg', 'adventure'], tagSlugs: ['story-rich', 'choices-matter', 'singleplayer'] },
  { id: 5, title: 'Outer Wilds', genre: 'Exploration adventure', reason: 'Rewards curiosity with a world that slowly reveals its own rules and secrets.', match: 80, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/753640/header.jpg', platforms: 'PC · Xbox · PlayStation', meta: '2019 · Mobius Digital', rating: 4.9, genreSlugs: ['action', 'adventure', 'indie'], tagSlugs: ['exploration', 'atmospheric', 'singleplayer'] },
  { id: 6, title: 'Slay the Spire', genre: 'Strategy deckbuilder', reason: 'A smart, replayable challenge that turns experimentation into a satisfying strategy loop.', match: 76, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/646570/header.jpg', platforms: 'PC · Xbox · Switch', meta: '2019 · Mega Crit', rating: 4.6, genreSlugs: ['strategy', 'indie'], tagSlugs: ['roguelike', 'singleplayer'] },
  { id: 7, title: 'Baldur\'s Gate 3', genre: 'Party-based RPG', reason: 'Deep role-playing, meaningful choices and a party of characters worth getting attached to.', match: 91, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg', platforms: 'PC · Xbox · PS5', meta: '2023 · Larian Studios', rating: 4.9, genreSlugs: ['rpg', 'strategy'], tagSlugs: ['turn-based-combat', 'choices-matter', 'story-rich'] },
  { id: 8, title: 'Stardew Valley', genre: 'Farming simulation', reason: 'A gentle, open-ended world with satisfying routines, exploration and long-term progression.', match: 78, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg', platforms: 'PC · Xbox · PlayStation · Switch', meta: '2016 · ConcernedApe', rating: 4.8, genreSlugs: ['simulation', 'indie', 'rpg'], tagSlugs: ['farming', 'open-world', 'singleplayer'] },
  { id: 9, title: 'The Witcher 3', genre: 'Open-world RPG', reason: 'A rich story-driven adventure where side quests feel as considered as the main path.', match: 85, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg', platforms: 'PC · Xbox · PlayStation · Switch', meta: '2015 · CD Projekt Red', rating: 4.7, genreSlugs: ['rpg', 'action', 'adventure'], tagSlugs: ['open-world', 'story-rich', 'singleplayer'] },
  { id: 10, title: 'Hollow Knight', genre: 'Metroidvania', reason: 'A beautiful, challenging world built around curiosity, mastery and hidden paths.', match: 83, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg', platforms: 'PC · Xbox · PlayStation · Switch', meta: '2017 · Team Cherry', rating: 4.8, genreSlugs: ['action', 'adventure', 'indie'], tagSlugs: ['metroidvania', 'atmospheric', 'exploration'] },
  { id: 11, title: 'Disco Elysium', genre: 'Narrative RPG', reason: 'A singular detective story for players who value writing, atmosphere and consequential choices.', match: 81, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/632470/header.jpg', platforms: 'PC · PlayStation · Xbox · Switch', meta: '2019 · ZA/UM', rating: 4.7, genreSlugs: ['rpg', 'adventure', 'indie'], tagSlugs: ['story-rich', 'choices-matter', 'narrative'] },
  { id: 12, title: 'It Takes Two', genre: 'Co-op adventure', reason: 'A playful co-operative journey that keeps introducing new ideas and shared challenges.', match: 74, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1426210/header.jpg', platforms: 'PC · Xbox · PlayStation', meta: '2021 · Hazelight Studios', rating: 4.6, genreSlugs: ['action', 'adventure'], tagSlugs: ['co-op', 'singleplayer', 'story-rich'] },
]

const starterLibrary: LibraryEntry[] = [
  { id: 101, title: 'Hades', status: 'Completed', image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=700&q=80', rating: 5, genreSlugs: ['action', 'indie'], tagSlugs: ['roguelike', 'singleplayer', 'story-rich'], review: 'A brilliant action loop with characters I wanted to spend more time with.', updated: 'Updated recently' },
  { id: 102, title: 'Octopath Traveler', status: 'Playing', image: 'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?auto=format&fit=crop&w=700&q=80', rating: 4.5, genreSlugs: ['rpg'], tagSlugs: ['turn-based-combat', 'story-rich', 'singleplayer'], review: '', updated: 'Updated recently' },
  { id: 103, title: 'Subnautica', status: 'Want to play', image: 'https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=700&q=80', rating: null, genreSlugs: ['action', 'adventure'], tagSlugs: ['survival', 'open-world', 'exploration'], review: '', updated: 'Added recently' },
]

const getStored = <T,>(key: string, fallback: T): T => {
  try { return JSON.parse(localStorage.getItem(key) ?? '') as T } catch { return fallback }
}

function App() {
  const [activeNav, setActiveNav] = useState('Discover')
  const [query, setQuery] = useState('')
  const [activeGenre, setActiveGenre] = useState('All genres')
  const [saved, setSaved] = useState<number[]>(() => getStored('wayfinder-saved', [2]))
  const [library, setLibrary] = useState<LibraryEntry[]>(() => getStored('wayfinder-library', starterLibrary).map((entry) => {
    if (entry.genreSlugs?.length || entry.tagSlugs?.length) return entry
    const known = [...starterLibrary, ...games].find((item) => item.title === entry.title)
    return { ...entry, genreSlugs: known?.genreSlugs ?? [], tagSlugs: known?.tagSlugs ?? [] }
  }))
  const [showAll, setShowAll] = useState(false)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [notice, setNotice] = useState('')
  const [remoteGames, setRemoteGames] = useState<Game[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [recommendations, setRecommendations] = useState<Game[]>([])

  useEffect(() => { localStorage.setItem('wayfinder-saved', JSON.stringify(saved)) }, [saved])
  useEffect(() => { localStorage.setItem('wayfinder-library', JSON.stringify(library)) }, [library])
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(''), 2600); return () => window.clearTimeout(timer) }, [notice])
  useEffect(() => {
    const search = query.trim()
    if (search.length < 1) {
      setRemoteGames([])
      setSearchError('')
      setSearchLoading(false)
      return
    }

    const controller = new AbortController()
    setSearchLoading(true)
    setSearchError('')
    fetch(`/api/games?search=${encodeURIComponent(search)}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error((await response.json()).message ?? 'RAWG search failed.')
        return response.json()
      })
      .then((data) => setRemoteGames((data.results ?? []).filter((game: RawgGame) => isRawgMatch(game, search)).sort(rankRawgResults(search)).map(mapRawgGame)))
      .catch((error: Error) => { if (error.name !== 'AbortError') setSearchError(error.message) })
      .finally(() => setSearchLoading(false))

    return () => controller.abort()
  }, [query])

  useEffect(() => {
    const rated = library.filter((entry) => entry.rating !== null)
    const ownedTitles = new Set(library.map((entry) => entry.title.toLowerCase()))
    const signalled = rated.filter((entry) => entry.genreSlugs.length || entry.tagSlugs.length)

    if (signalled.length === 0) {
      setRecommendations(scoreCandidates(rated, games, ownedTitles))
      return
    }

    const genreTally = new Map<string, number>()
    const tagTally = new Map<string, number>()
    signalled.forEach((entry) => {
      entry.genreSlugs.forEach((slug) => genreTally.set(slug, (genreTally.get(slug) ?? 0) + (entry.rating ?? 0)))
      entry.tagSlugs.forEach((slug) => tagTally.set(slug, (tagTally.get(slug) ?? 0) + (entry.rating ?? 0)))
    })
    const topGenres = [...genreTally.entries()].sort((first, second) => second[1] - first[1]).slice(0, 2).map(([slug]) => slug)
    const topTags = [...tagTally.entries()].sort((first, second) => second[1] - first[1]).slice(0, 3).map(([slug]) => slug)

    const controller = new AbortController()
    const params = new URLSearchParams()
    if (topGenres.length) params.set('genres', topGenres.join(','))
    if (topTags.length) params.set('tags', topTags.join(','))

    fetch(`/api/games?${params.toString()}`, { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error('RAWG discovery failed.'); return response.json() })
      .then((data) => setRecommendations(scoreCandidates(rated, (data.results ?? []).map(mapRawgGame), ownedTitles)))
      .catch((error: Error) => { if (error.name !== 'AbortError') setRecommendations(scoreCandidates(rated, games, ownedTitles)) })

    return () => controller.abort()
  }, [library])

  const filteredGames = useMemo(() => {
    const normalizedQuery = query.toLowerCase()
    return games.filter((game) => {
      const matchesQuery = game.title.toLowerCase().includes(normalizedQuery) || game.genre.toLowerCase().includes(normalizedQuery)
      const matchesGenre = activeGenre === 'All genres' || game.genre.toLowerCase().includes(activeGenre.toLowerCase())
      return matchesQuery && matchesGenre
    })
  }, [activeGenre, query])

  const toggleSaved = (id: number) => setSaved((current) => current.includes(id) ? current.filter((gameId) => gameId !== id) : [...current, id])
  const addToLibrary = (game: Game, status: LibraryEntry['status'] = 'Want to play') => {
    if (library.some((entry) => entry.title === game.title)) { setNotice(`${game.title} is already in your library`); return }
    setLibrary((current) => [...current, { id: Date.now(), title: game.title, status, image: game.image, rating: null, review: '', updated: 'Added just now', genreSlugs: game.genreSlugs, tagSlugs: game.tagSlugs }])
    setNotice(`${game.title} added to your library`)
    setSelectedGame(null)
  }
  const updateEntry = (id: number, updates: Partial<LibraryEntry>) => setLibrary((current) => current.map((entry) => entry.id === id ? { ...entry, ...updates, updated: 'Updated just now' } : entry))
  const removeEntry = (id: number) => { const entry = library.find((item) => item.id === id); setLibrary((current) => current.filter((item) => item.id !== id)); setNotice(`${entry?.title ?? 'Game'} removed from your library`) }

  return <div className="app-shell">
    <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} libraryCount={library.length} profileStrength={Math.min(96, 52 + library.filter((item) => item.rating).length * 7)} />
    <main className="content">
      <header className="topbar"><div className="breadcrumb"><span>Workspace</span><b>/</b><strong>{activeNav}</strong></div><div className="top-actions"><button className="notification" aria-label="Notifications">♢<i /></button><div className="mini-avatar">CJ</div></div></header>
      {activeNav === 'Discover' && <Discover query={query} setQuery={setQuery} activeGenre={activeGenre} setActiveGenre={setActiveGenre} filteredGames={query.trim().length >= 1 ? remoteGames : filteredGames} recommendations={recommendations} saved={saved} toggleSaved={toggleSaved} showAll={showAll} setShowAll={setShowAll} setSelectedGame={setSelectedGame} setActiveNav={setActiveNav} library={library} searchLoading={searchLoading} searchError={searchError} />}
      {activeNav === 'My library' && <LibraryView library={library} setShowAdd={setShowAdd} updateEntry={updateEntry} removeEntry={removeEntry} setActiveNav={setActiveNav} />}
      {activeNav === 'Reviews' && <ReviewsView library={library} updateEntry={updateEntry} setActiveNav={setActiveNav} />}
    </main>
    {selectedGame && <GameModal game={selectedGame} inLibrary={library.some((entry) => entry.title === selectedGame.title)} close={() => setSelectedGame(null)} addToLibrary={addToLibrary} toggleSaved={toggleSaved} saved={saved.includes(selectedGame.id)} />}
    {showAdd && <AddGameModal close={() => setShowAdd(false)} addGame={(title, status) => { const match = games.find((game) => game.title.toLowerCase() === title.toLowerCase()); if (match) addToLibrary(match, status); else { setLibrary((current) => [...current, { id: Date.now(), title, status, image: games[0].image, rating: null, review: '', updated: 'Added just now', genreSlugs: [], tagSlugs: [] }]); setNotice(`${title} added to your library`) } setShowAdd(false) }} />}
    {notice && <div className="toast">✓ {notice}</div>}
  </div>
}

function scoreCandidates(rated: LibraryEntry[], candidates: Game[], ownedTitles: Set<string>) {
  return candidates
    .filter((game) => !ownedTitles.has(game.title.toLowerCase()))
    .map((game) => {
      const candidateSignals = [...game.genreSlugs, ...game.tagSlugs]
      const bestMatch = rated
        .map((seed) => {
          const seedSignals = [...seed.genreSlugs, ...seed.tagSlugs]
          const shared = seedSignals.filter((signal) => candidateSignals.includes(signal))
          return { seed, shared, score: shared.length * (seed.rating ?? 0) }
        })
        .sort((first, second) => second.score - first.score)[0]
      if (!bestMatch || bestMatch.shared.length === 0) return null
      const matchPercent = Math.min(98, Math.round(58 + bestMatch.shared.length * 8 + (bestMatch.seed.rating ?? 0) * 3))
      const sharedText = bestMatch.shared.slice(0, 3).map(formatSlug).join(', ')
      return { ...game, match: matchPercent, reason: `Because you rated ${bestMatch.seed.title} ${bestMatch.seed.rating}/5. Shared signals: ${sharedText}.` }
    })
    .filter((game): game is Game => game !== null)
    .sort((first, second) => second.match - first.match)
    .slice(0, 12)
}

function formatSlug(slug: string) {
  if (slug === 'rpg') return 'RPG'
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function rankRawgResults(search: string) {
  const normalizedSearch = search.toLowerCase().trim()
  return (first: RawgGame, second: RawgGame) => {
    const firstScore = rawgRelevanceScore(first, normalizedSearch)
    const secondScore = rawgRelevanceScore(second, normalizedSearch)
    if (firstScore !== secondScore) return firstScore - secondScore
    if (isGtaSearch(normalizedSearch) && isGtaTitle(first.name) && isGtaTitle(second.name)) return gtaVersion(second.name) - gtaVersion(first.name)
    if (isFifaSearch(normalizedSearch) && isFifaTitle(first.name) && isFifaTitle(second.name)) return fifaYear(second.name) - fifaYear(first.name)
    if ((second.ratings_count ?? 0) !== (first.ratings_count ?? 0)) return (second.ratings_count ?? 0) - (first.ratings_count ?? 0)
    if ((second.rating ?? 0) !== (first.rating ?? 0)) return (second.rating ?? 0) - (first.rating ?? 0)
    return (second.released ?? '').localeCompare(first.released ?? '')
  }
}

function isRawgMatch(game: RawgGame, search: string) {
  const title = game.name.toLowerCase()
  const normalizedSearch = search.toLowerCase().trim()
  return title.includes(normalizedSearch) || title.includes('grand theft auto') && isGtaSearch(normalizedSearch) || game.genres?.some((genre) => genre.name.toLowerCase().includes(normalizedSearch))
}

function rawgRelevanceScore(game: RawgGame, search: string) {
  const title = game.name.toLowerCase()
  const matchesGtaFranchise = isGtaSearch(search) && title.includes('grand theft auto')
  const matchesFortnite = search.startsWith('fort') && title.startsWith('fortnite')
  if (title === search) return 0
  if (matchesFortnite && title === 'fortnite') return 0
  if (matchesGtaFranchise && title.startsWith('grand theft auto')) return 0
  if (matchesFortnite) return 1
  if (title.startsWith(search) || matchesGtaFranchise && title.startsWith('grand theft auto')) return 1
  if (title.includes(` ${search}`) || matchesGtaFranchise) return 2
  if (title.includes(search)) return 3
  return 4
}

function isGtaSearch(search: string) {
  return search === 'gta' || search === 'grand theft auto' || search.includes('gta 6') || search.includes('gta vi')
}

function isGtaTitle(title: string) {
  return title.toLowerCase().includes('grand theft auto')
}

function gtaVersion(title: string) {
  const normalizedTitle = title.toLowerCase()
  const versions: [string, number][] = [['vi', 6], ['v', 5], ['iv', 4], ['iii', 3], ['ii', 2], ['i', 1]]
  const match = versions.find(([version]) => new RegExp(`\\b${version}\\b`).test(normalizedTitle))
  return match?.[1] ?? 0
}

function isFifaSearch(search: string) {
  return search.includes('fifa')
}

function isFifaTitle(title: string) {
  return title.toLowerCase().includes('fifa')
}

function fifaYear(title: string) {
  const match = title.match(/fifa(?: soccer)?\s+(\d{2,4})/i)
  if (!match) return 0
  const year = Number(match[1])
  return year < 100 ? 2000 + year : year
}

const genrePillSlugs: Record<string, string> = { RPG: 'rpg', Adventure: 'adventure', Strategy: 'strategy' }

function matchesGenrePill(game: Game, pill: string) {
  const slug = genrePillSlugs[pill]
  if (slug && game.genreSlugs.includes(slug)) return true
  return game.genre.toLowerCase().includes(pill.toLowerCase())
}

type RawgGame = {
  id: number
  name: string
  background_image?: string
  rating?: number
  ratings_count?: number
  released?: string
  genres?: { name: string, slug: string }[]
  tags?: { name: string, slug: string }[]
  platforms?: { platform: { name: string } }[]
}

function mapRawgGame(game: RawgGame): Game {
  return {
    id: game.id,
    title: game.name,
    genre: game.genres?.[0]?.name ?? 'Game',
    reason: 'Found in the RAWG game database. Open this result to add it to your library.',
    match: Math.round((game.rating ?? 0) * 20),
    image: game.background_image ?? '',
    platforms: game.platforms?.slice(0, 4).map((item) => item.platform.name).join(' · ') || 'Platform details unavailable',
    meta: `${game.released?.slice(0, 4) ?? 'Release date unknown'} · RAWG database`,
    rating: game.rating ?? 0,
    genreSlugs: game.genres?.map((genre) => genre.slug) ?? [],
    tagSlugs: game.tags?.slice(0, 5).map((tag) => tag.slug) ?? [],
  }
}

function Sidebar({ activeNav, setActiveNav, libraryCount, profileStrength }: { activeNav: string, setActiveNav: (value: string) => void, libraryCount: number, profileStrength: number }) {
  return <aside className="sidebar"><div className="brand"><span className="brand-mark">◒</span><span>wayfinder</span></div><div className="profile-card"><div className="avatar">CJ</div><div><strong>Casey Johnson</strong><span>Curious collector</span></div><button className="icon-button" aria-label="Open profile menu">···</button></div><nav className="main-nav" aria-label="Main navigation">{['Discover', 'My library', 'Reviews'].map((item) => <button key={item} className={activeNav === item ? 'nav-item active' : 'nav-item'} onClick={() => setActiveNav(item)}><span className="nav-icon">{item === 'Discover' ? '⌕' : item === 'My library' ? '▱' : '✦'}</span>{item}{item === 'My library' && <span className="nav-count">{libraryCount}</span>}</button>)}</nav><div className="sidebar-bottom"><div className="taste-progress"><div><span>Profile strength</span><b>{profileStrength}%</b></div><div className="progress-track"><span style={{ width: `${profileStrength}%` }} /></div><small>{profileStrength < 75 ? 'Rate more games for sharper matches' : 'Your recommendations are getting sharper'}</small></div><button className="nav-item"><span className="nav-icon">⚙</span>Settings</button><div className="sidebar-foot"><span className="status-dot" /> Recommendations are learning</div></div></aside>
}

function Discover({ query, setQuery, activeGenre, setActiveGenre, filteredGames, recommendations, saved, toggleSaved, showAll, setShowAll, setSelectedGame, setActiveNav, library, searchLoading, searchError }: { query: string, setQuery: (value: string) => void, activeGenre: string, setActiveGenre: (value: string) => void, filteredGames: Game[], recommendations: Game[], saved: number[], toggleSaved: (id: number) => void, showAll: boolean, setShowAll: (value: boolean) => void, setSelectedGame: (game: Game) => void, setActiveNav: (value: string) => void, library: LibraryEntry[], searchLoading: boolean, searchError: string }) {
  const baseGames = query.trim() ? filteredGames : recommendations
  const displayGames = activeGenre === 'All genres' ? baseGames : baseGames.filter((game) => matchesGenrePill(game, activeGenre))
  const visibleGames = showAll || query.trim() ? displayGames : displayGames.slice(0, 3)
  const ratedSeed = library.find((entry) => entry.rating !== null)
  return <><section className="welcome-row"><div><p className="eyebrow">THURSDAY, 23 SEPTEMBER 2026</p><h1>Find your next <em>favourite</em>.</h1><p className="intro">A little direction for the games you haven't met yet.</p></div><div className="streak"><span className="streak-icon">✦</span><div><strong>4 day streak</strong><small>Keep exploring</small></div></div></section><section className="preference-banner"><div className="banner-copy"><span className="spark">✦</span><div><strong>Your taste map is taking shape</strong><p>You have rated {library.filter((item) => item.rating).length} games. Add a few more to unlock more confident recommendations.</p></div></div><button className="banner-button" onClick={() => setActiveNav('Reviews')}>Rate games <span>→</span></button></section><section className="section-header"><div><p className="eyebrow accent">{query ? 'RAWG GAME DATABASE' : 'PERSONALISED RECOMMENDATIONS'}</p><h2>{query ? `Results for “${query}”` : ratedSeed ? `Because you rated ${ratedSeed.title} ${ratedSeed.rating}/5` : 'Rate a game to get recommendations'}</h2></div><button className="text-button" onClick={() => setShowAll(!showAll)}>{showAll ? 'Show less' : 'See all'} <span>↗</span></button></section><div className="filters"><div className="search-field"><span>⌕</span><input id="game-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search RAWG games" /></div><div className="filter-pills">{['All genres', 'RPG', 'Adventure', 'Strategy'].map((genre) => <button key={genre} className={activeGenre === genre ? 'filter active' : 'filter'} onClick={() => setActiveGenre(genre)}>{genre}</button>)}</div></div><p className="data-attribution">Game data and artwork provided by <a href="https://rawg.io/" target="_blank" rel="noreferrer">RAWG</a>.</p>{!query && ratedSeed && <p className="recommendation-note">Each card explains which of your ratings influenced it and what signals were shared.</p>}{searchLoading && <div className="empty-state">Searching the RAWG game database...</div>}{searchError && <div className="empty-state error-state">{searchError}<small> Add your replacement API key to `.env.local`, then restart the dev server.</small></div>}<div className="recommendation-grid">{!searchLoading && visibleGames.map((game, index) => <GameCard key={game.id} game={game} index={index} saved={saved.includes(game.id)} toggleSaved={toggleSaved} open={() => setSelectedGame(game)} />)}</div>{!searchLoading && !searchError && displayGames.length === 0 && <div className="empty-state">Rate a game in Reviews and Wayfinder will start building recommendations for you.</div>}{!query && <section className="library-section"><div className="section-header"><div><p className="eyebrow">KEEPING TRACK</p><h2>Your library</h2></div><button className="text-button" onClick={() => setActiveNav('My library')}>Open library <span>↗</span></button></div><div className="library-list">{library.slice(0, 3).map((game) => <LibraryRow key={game.id} entry={game} compact />)}</div></section>}</>
}

function GameCard({ game, index, saved, toggleSaved, open }: { game: Game, index: number, saved: boolean, toggleSaved: (id: number) => void, open: () => void }) {
  return <article className="game-card" style={{ '--delay': `${index * 80}ms` } as CSSProperties} onClick={open}><div className="cover-wrap">{game.image ? <img src={game.image} alt="" /> : <div className="cover-placeholder"><span>{game.title.slice(0, 1)}</span><small>Artwork unavailable</small></div>}<span className="match-badge">{game.match}% match</span><button className={saved ? 'save-button saved' : 'save-button'} onClick={(event) => { event.stopPropagation(); toggleSaved(game.id) }} aria-label={`Save ${game.title}`}>{saved ? '♥' : '♡'}</button></div><div className="game-card-body"><div className="card-kicker"><span>{game.genre}</span><span>★ {game.rating}</span></div><h3>{game.title}</h3><p>{game.reason}</p><div className="card-meta"><span>{game.meta}</span><span>{game.platforms}</span></div></div></article>
}

function LibraryView({ library, setShowAdd, updateEntry, removeEntry, setActiveNav }: { library: LibraryEntry[], setShowAdd: (value: boolean) => void, updateEntry: (id: number, updates: Partial<LibraryEntry>) => void, removeEntry: (id: number) => void, setActiveNav: (value: string) => void }) {
  const [filter, setFilter] = useState('All games')
  const visible = filter === 'All games' ? library : library.filter((entry) => entry.status === filter)
  return <><section className="page-heading"><div><p className="eyebrow accent">YOUR COLLECTION</p><h1>My <em>library</em>.</h1><p className="intro">Keep your next play session within reach.</p></div><div className="page-actions"><button className="secondary-button" onClick={() => setActiveNav('Reviews')}>★ Rate your games</button><button className="primary-button" onClick={() => setShowAdd(true)}>＋ Add a game</button></div></section><div className="library-summary"><div><strong>{library.length}</strong><span>total games</span></div><div><strong>{library.filter((game) => game.status === 'Completed').length}</strong><span>completed</span></div><div><strong>{library.filter((game) => game.status === 'Want to play').length}</strong><span>on your list</span></div><div><strong>{library.filter((game) => game.rating).length}</strong><span>rated</span></div></div><div className="library-toolbar"><div className="filter-pills">{['All games', 'Playing', 'Want to play', 'Completed', 'Dropped'].map((item) => <button key={item} className={filter === item ? 'filter active' : 'filter'} onClick={() => setFilter(item)}>{item}</button>)}</div></div><div className="full-library">{visible.length ? visible.map((entry) => <LibraryRow key={entry.id} entry={entry} updateEntry={updateEntry} removeEntry={removeEntry} setActiveNav={setActiveNav} />) : <div className="empty-state">Nothing here yet. Add a game to start building this list.</div>}</div></>
}

function LibraryRow({ entry, compact = false, updateEntry, removeEntry, setActiveNav }: { entry: LibraryEntry, compact?: boolean, updateEntry?: (id: number, updates: Partial<LibraryEntry>) => void, removeEntry?: (id: number) => void, setActiveNav?: (value: string) => void }) {
  const canRate = !entry.rating && (entry.status === 'Playing' || entry.status === 'Completed')
  return <div className={compact ? 'library-row compact' : 'library-row full'}><img src={entry.image} alt="" /><div className="library-title"><strong>{entry.title}</strong><span>{entry.updated}</span></div><select className="status-select" value={entry.status} onChange={(event) => updateEntry?.(entry.id, { status: event.target.value as LibraryEntry['status'] })} aria-label={`Status for ${entry.title}`}><option>Completed</option><option>Playing</option><option>Want to play</option><option>Dropped</option></select>{canRate && <button className="rate-row-button" onClick={() => setActiveNav?.('Reviews')}>Rate this game <span>→</span></button>}{entry.rating ? <span className="rating">★ {entry.rating}</span> : <span className="rating muted">—</span>}{!compact && <button className="remove-button" onClick={() => removeEntry?.(entry.id)}>Remove</button>}</div>
}

function ReviewsView({ library, updateEntry, setActiveNav }: { library: LibraryEntry[], updateEntry: (id: number, updates: Partial<LibraryEntry>) => void, setActiveNav: (value: string) => void }) {
  const ratedGames = library.filter((entry) => entry.rating)
  const unratedGames = library.filter((entry) => !entry.rating)
  return <><section className="page-heading"><div><p className="eyebrow accent">YOUR VOICE</p><h1>Ratings & <em>reviews</em>.</h1><p className="intro">Your notes make future recommendations more personal.</p></div></section><section className="review-panel"><div className="review-panel-header"><div><p className="eyebrow">NEEDS YOUR TAKE</p><h2>Games to rate</h2></div><span>{unratedGames.length} waiting</span></div>{unratedGames.length ? unratedGames.map((entry) => <ReviewEditor key={entry.id} entry={entry} updateEntry={updateEntry} />) : <div className="empty-state">Everything in your library has a rating. Nice work.</div>}</section><section className="review-panel"><div className="review-panel-header"><div><p className="eyebrow">YOUR REVIEWS</p><h2>What you've said</h2></div><span>{ratedGames.length} rated</span></div>{ratedGames.length ? ratedGames.map((entry) => <ReviewEditor key={entry.id} entry={entry} updateEntry={updateEntry} />) : <button className="text-button" onClick={() => setActiveNav('My library')}>Add a rating from your library ↗</button>}</section></>
}

function ReviewEditor({ entry, updateEntry }: { entry: LibraryEntry, updateEntry: (id: number, updates: Partial<LibraryEntry>) => void }) {
  return <div className="review-editor"><img src={entry.image} alt="" /><div className="review-main"><strong>{entry.title}</strong><div className="star-picker">{[1, 2, 3, 4, 5].map((star) => <button key={star} className={entry.rating !== null && star <= entry.rating ? 'star selected' : 'star'} onClick={() => updateEntry(entry.id, { rating: star })} aria-label={`Rate ${star} out of 5`}>★</button>)}</div><textarea value={entry.review} onChange={(event) => updateEntry(entry.id, { review: event.target.value })} placeholder="What did you think? (optional)" /></div></div>
}

function GameModal({ game, inLibrary, close, addToLibrary, toggleSaved, saved }: { game: Game, inLibrary: boolean, close: () => void, addToLibrary: (game: Game, status?: LibraryEntry['status']) => void, toggleSaved: (id: number) => void, saved: boolean }) {
  return <div className="modal-backdrop" onClick={close}><div className="game-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={close}>×</button>{game.image ? <img className="modal-cover" src={game.image} alt="" /> : <div className="modal-cover modal-placeholder"><span>{game.title.slice(0, 1)}</span><small>Artwork unavailable from RAWG</small></div>}<div className="modal-content"><p className="eyebrow accent">{game.match}% PERSONAL MATCH · {game.genre}</p><h2>{game.title}</h2><p className="modal-reason">{game.reason}</p><div className="why-box"><strong>Why this was suggested</strong><span>Genres: {game.genreSlugs.length ? game.genreSlugs.map(formatSlug).join(' · ') : game.genre}</span><span>Tags: {game.tagSlugs.length ? game.tagSlugs.map(formatSlug).join(' · ') : 'Not listed by RAWG'}</span><span>Platforms: {game.platforms}</span></div><div className="modal-actions"><button className="primary-button" onClick={() => addToLibrary(game)}>{inLibrary ? 'Already in library' : '＋ Add to library'}</button><button className={saved ? 'secondary-button saved' : 'secondary-button'} onClick={() => toggleSaved(game.id)}>{saved ? '♥ Saved' : '♡ Save for later'}</button></div></div></div></div>
}

function AddGameModal({ close, addGame }: { close: () => void, addGame: (title: string, status: LibraryEntry['status']) => void }) {
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState<LibraryEntry['status']>('Want to play')
  const submit = (event: FormEvent) => { event.preventDefault(); if (title.trim()) addGame(title.trim(), status) }
  return <div className="modal-backdrop" onClick={close}><form className="add-modal" onSubmit={submit} onClick={(event) => event.stopPropagation()}><button type="button" className="modal-close" onClick={close}>×</button><p className="eyebrow accent">BUILD YOUR LIBRARY</p><h2>Add a game</h2><p className="modal-reason">Start with a game you already know, or add something you want to discover.</p><label>Game title<input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. The Legend of Zelda" /></label><label>Play status<select value={status} onChange={(event) => setStatus(event.target.value as LibraryEntry['status'])}><option>Want to play</option><option>Playing</option><option>Completed</option><option>Dropped</option></select></label><button className="primary-button" type="submit">Add to library <span>→</span></button></form></div>
}

export default App
