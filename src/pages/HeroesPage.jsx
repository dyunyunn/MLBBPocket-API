import { useState, useEffect } from 'react'
import { Search, Loader, Plus, Heart, Filter } from 'lucide-react'
import apiClient from '../config/api'

const DEFAULT_ROLES = ['Fighter', 'Marksman', 'Mage', 'Tank', 'Assassin', 'Support']
const DEFAULT_LANES = ['EXP Lane', 'Gold Lane', 'Mid Lane', 'Roam', 'Jungling']

export default function HeroesPage({
  onSelectHero,
  onAddHero,
  favHeroIds,
  onToggleFavHero,
}) {
  const [heroes, setHeroes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedRole, setSelectedRole] = useState('All')
  const [selectedLane, setSelectedLane] = useState('All')

  useEffect(() => {
    const fetchHeroes = async () => {
      try {
        const res = await apiClient.get('/heroes')
        setHeroes(res.data.filter((h) => !h.is_deleted))
      } catch {
        setError('Gagal memuat data hero dari server.')
      } finally {
        setLoading(false)
      }
    }
    fetchHeroes()
  }, [])

  const roles = [
    'All',
    ...new Set([...DEFAULT_ROLES, ...heroes.map((h) => h.role).filter(Boolean)]),
  ]
  const lanes = [
    'All',
    ...new Set([...DEFAULT_LANES, ...heroes.map((h) => h.lane).filter(Boolean)]),
  ]

  const filtered = heroes.filter((hero) => {
    const matchName = hero.name.toLowerCase().includes(search.toLowerCase())
    const matchRole = selectedRole === 'All' || hero.role === selectedRole
    const matchLane = selectedLane === 'All' || hero.lane === selectedLane
    return matchName && matchRole && matchLane
  })

  return (
    <div className="page">
      <header className="page-header header-row">
        <div>
          <h1>MLBBPocket</h1>
          <p>Katalog Hero & Rekomendasi Build Item</p>
        </div>
        <button type="button" className="btn-add" onClick={onAddHero}>
          <Plus size={16} /> Tambah
        </button>
      </header>

      <div className="search-box">
        <Search size={18} />
        <input
          type="text"
          placeholder="Cari nama hero..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="filter-toolbar">
        <div className="pills">
          {roles.map((role) => (
            <button
              key={role}
              type="button"
              className={`pill ${selectedRole === role ? 'active' : ''}`}
              onClick={() => setSelectedRole(role)}
            >
              {role}
            </button>
          ))}
        </div>

        <label className="filter-select-wrap">
          <Filter size={15} />
          <select
            className="filter-select"
            value={selectedLane}
            onChange={(e) => setSelectedLane(e.target.value)}
            aria-label="Filter Lane"
          >
            {lanes.map((lane) => (
              <option key={lane} value={lane}>
                {lane === 'All' ? 'Semua Lane' : lane}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading && (
        <div className="center-state">
          <Loader className="spin" size={28} />
          <p>Memuat daftar hero...</p>
        </div>
      )}

      {error && <p className="error-text">{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <div className="center-state">
          <p>Hero tidak ditemukan.</p>
        </div>
      )}

      <div className="card-grid">
        {filtered.map((hero) => {
          const isFav = favHeroIds.includes(hero.id)
          return (
            <div
              key={hero.id}
              className="card"
              onClick={() => onSelectHero(hero)}
            >
              <button
                type="button"
                className={`fav-btn ${isFav ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleFavHero(hero.id)
                }}
              >
                <Heart size={14} fill={isFav ? 'currentColor' : 'none'} />
              </button>
              <img src={hero.image_url} alt={hero.name} className="card-img" />
              <div className="card-body">
                <span className="badge">{hero.role}</span>
                <h3>{hero.name}</h3>
                <p className="muted">
                  {hero.lane} • {hero.specialty || '-'}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}