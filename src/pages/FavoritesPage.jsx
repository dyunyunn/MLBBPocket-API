import { useState, useEffect } from 'react'
import { Heart, Loader } from 'lucide-react'
import apiClient from '../config/api'

export default function FavoritesPage({
  favHeroIds,
  favItemIds,
  onToggleFavHero,
  onToggleFavItem,
  onSelectHero,
  onSelectItem,
}) {
  const [heroes, setHeroes] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [hRes, iRes] = await Promise.all([
          apiClient.get('/heroes'),
          apiClient.get('/items'),
        ])
        setHeroes(hRes.data.filter((h) => !h.is_deleted))
        setItems(iRes.data.filter((i) => !i.is_deleted))
      } catch (err) {
        console.error('Gagal memuat favorit:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const favHeroes = heroes.filter((h) => favHeroIds.includes(h.id))
  const favItems = items.filter((i) => favItemIds.includes(i.id))
  const isEmpty = favHeroes.length === 0 && favItems.length === 0

  return (
    <div className="page">
      <header className="page-header">
        <h1>Favorites</h1>
        <p>Hero & Item andalan yang kamu simpan</p>
      </header>

      {loading && (
        <div className="center-state">
          <Loader className="spin" size={28} />
          <p>Memuat daftar favorit...</p>
        </div>
      )}

      {!loading && isEmpty && (
        <div className="center-state">
          <Heart size={36} style={{ marginBottom: 8, opacity: 0.4 }} />
          <p>Belum ada Hero atau Item favorit.</p>
          <p className="muted">Klik ikon hati pada kartu untuk menyimpan.</p>
        </div>
      )}

      {!loading && favHeroes.length > 0 && (
        <section className="trash-section">
          <h3 className="trash-title">Hero Favorit ({favHeroes.length})</h3>
          <div className="card-grid">
            {favHeroes.map((hero) => (
              <div key={hero.id} className="card" onClick={() => onSelectHero(hero)}>
                <button
                  type="button"
                  className="fav-btn active"
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavHero(hero.id)
                  }}
                >
                  <Heart size={16} fill="currentColor" />
                </button>
                <img src={hero.image_url} alt={hero.name} className="card-img" />
                <div className="card-body">
                  <span className="badge">{hero.role}</span>
                  <h3>{hero.name}</h3>
                  <p className="muted">{hero.lane}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!loading && favItems.length > 0 && (
        <section className="trash-section">
          <h3 className="trash-title">Item Favorit ({favItems.length})</h3>
          <div className="card-grid">
            {favItems.map((item) => (
              <div key={item.id} className="card" onClick={() => onSelectItem(item)}>
                <button
                  type="button"
                  className="fav-btn active"
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavItem(item.id)
                  }}
                >
                  <Heart size={16} fill="currentColor" />
                </button>
                <img src={item.image_url} alt={item.name} className="card-img" />
                <div className="card-body">
                  <span className="badge">{item.category}</span>
                  <h3>{item.name}</h3>
                  <p className="price">{item.price} Gold</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}