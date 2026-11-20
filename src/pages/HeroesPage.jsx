import { useState, useEffect } from 'react'
import { Search, Loader } from 'lucide-react'
import apiClient from '../config/api'

export default function HeroesPage({ onSelectHero }) {
  const [heroes, setHeroes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedRole, setSelectedRole] = useState('All')

  useEffect(() => {
    const fetchHeroes = async () => {
      try {
        const res = await apiClient.get('/heroes')
        setHeroes(res.data)
      } catch (err) {
        setError('Gagal memuat data hero dari server.')
      } finally {
        setLoading(false)
      }
    }
    fetchHeroes()
  }, [])

  const roles = ['All', ...new Set(heroes.map((h) => h.role))]

  const filtered = heroes.filter((hero) => {
    const matchName = hero.name.toLowerCase().includes(search.toLowerCase())
    const matchRole = selectedRole === 'All' || hero.role === selectedRole
    return matchName && matchRole
  })

  return (
    <div className="page">
      <header className="page-header">
        <h1>MLBBPocket</h1>
        <p>Katalog Hero & Rekomendasi Build Item</p>
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

      <div className="pills">
        {roles.map((role) => (
          <button
            key={role}
            className={`pill ${selectedRole === role ? 'active' : ''}`}
            onClick={() => setSelectedRole(role)}
          >
            {role}
          </button>
        ))}
      </div>

      {loading && (
        <div className="center-state">
          <Loader className="spin" size={28} />
          <p>Memuat daftar hero...</p>
        </div>
      )}

      {error && <p className="error-text">{error}</p>}

      <div className="card-grid">
        {filtered.map((hero) => (
          <div key={hero.id} className="card" onClick={() => onSelectHero(hero)}>
            <img src={hero.image_url} alt={hero.name} className="card-img" />
            <div className="card-body">
              <span className="badge">{hero.role}</span>
              <h3>{hero.name}</h3>
              <p className="muted">{hero.lane} • {hero.specialty}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}