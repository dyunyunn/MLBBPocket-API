import { useState, useEffect } from 'react'
import apiClient from './config/api'
import SplashScreen from './components/SplashScreen'
import BottomNav from './components/BottomNav'
import HeroesPage from './pages/HeroesPage'
import ItemsPage from './pages/ItemsPage'
import FavoritesPage from './pages/FavoritesPage'
import TrashPage from './pages/TrashPage'
import ProfilePage from './pages/ProfilePage'
import HeroDetailPage from './pages/HeroDetailPage'
import ItemDetailPage from './pages/ItemDetailPage'
import HeroFormPage from './pages/HeroFormPage'
import ItemFormPage from './pages/ItemFormPage'

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [activeTab, setActiveTab] = useState('heroes')
  const [refreshKey, setRefreshKey] = useState(0)

  // State favorit yang disinkronkan dengan Supabase (kolom is_favorite)
  const [favHeroIds, setFavHeroIds] = useState([])
  const [favItemIds, setFavItemIds] = useState([])

  // State halaman detail & form
  const [selectedHero, setSelectedHero] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [heroFormTarget, setHeroFormTarget] = useState(null) // null = tutup, {} = tambah, {id...} = edit
  const [itemFormTarget, setItemFormTarget] = useState(null)

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1)

  // Ambil daftar favorit terbaru dari database saat aplikasi dimuat / di-refresh
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const [hRes, iRes] = await Promise.all([
          apiClient.get('/heroes'),
          apiClient.get('/items'),
        ])
        setFavHeroIds(
          hRes.data
            .filter((h) => !h.is_deleted && Boolean(h.is_favorite))
            .map((h) => h.id)
        )
        setFavItemIds(
          iRes.data
            .filter((i) => !i.is_deleted && Boolean(i.is_favorite))
            .map((i) => i.id)
        )
      } catch (err) {
        console.error('Gagal mengambil data favorit dari server:', err)
      }
    }
    fetchFavorites()
  }, [refreshKey])

  // Simpan perubahan favorit Hero ke Supabase
  const handleToggleFavHero = async (heroId) => {
    const isCurrentlyFav = favHeroIds.includes(heroId)
    const nextValue = !isCurrentlyFav

    setFavHeroIds((prev) =>
      nextValue ? [...prev, heroId] : prev.filter((id) => id !== heroId)
    )

    try {
      await apiClient.put(`/heroes/${heroId}`, { is_favorite: nextValue })
    } catch (err) {
      console.error('Gagal update favorit hero:', err)
      setFavHeroIds((prev) =>
        isCurrentlyFav ? [...prev, heroId] : prev.filter((id) => id !== heroId)
      )
      alert('Gagal menyimpan favorit hero ke server.')
    }
  }

  // Simpan perubahan favorit Item ke Supabase
  const handleToggleFavItem = async (itemId) => {
    const isCurrentlyFav = favItemIds.includes(itemId)
    const nextValue = !isCurrentlyFav

    setFavItemIds((prev) =>
      nextValue ? [...prev, itemId] : prev.filter((id) => id !== itemId)
    )

    try {
      await apiClient.put(`/items/${itemId}`, { is_favorite: nextValue })
    } catch (err) {
      console.error('Gagal update favorit item:', err)
      setFavItemIds((prev) =>
        isCurrentlyFav ? [...prev, itemId] : prev.filter((id) => id !== itemId)
      )
      alert('Gagal menyimpan favorit item ke server.')
    }
  }

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />
  }

  return (
    <div className="app-shell">
      {activeTab === 'heroes' && (
        <HeroesPage
          key={`heroes-${refreshKey}`}
          onSelectHero={(hero) => setSelectedHero(hero)}
          onAddHero={() => setHeroFormTarget({})}
          favHeroIds={favHeroIds}
          onToggleFavHero={handleToggleFavHero}
        />
      )}

      {activeTab === 'items' && (
        <ItemsPage
          key={`items-${refreshKey}`}
          onSelectItem={(item) => setSelectedItem(item)}
          onAddItem={() => setItemFormTarget({})}
          favItemIds={favItemIds}
          onToggleFavItem={handleToggleFavItem}
        />
      )}

      {activeTab === 'favorites' && (
        <FavoritesPage
          key={`fav-${refreshKey}`}
          favHeroIds={favHeroIds}
          favItemIds={favItemIds}
          onToggleFavHero={handleToggleFavHero}
          onToggleFavItem={handleToggleFavItem}
          onSelectHero={(hero) => setSelectedHero(hero)}
          onSelectItem={(item) => setSelectedItem(item)}
        />
      )}

      {activeTab === 'trash' && (
        <TrashPage key={`trash-${refreshKey}`} />
      )}

      {activeTab === 'profile' && (
        <ProfilePage
          favHeroCount={favHeroIds.length}
          favItemCount={favItemIds.length}
        />
      )}

      {selectedHero && (
        <HeroDetailPage
          hero={selectedHero}
          onBack={() => setSelectedHero(null)}
          onClose={() => setSelectedHero(null)}
          onEdit={(hero) => {
            setSelectedHero(null)
            setHeroFormTarget(hero)
          }}
          onDeleted={() => {
            setSelectedHero(null)
            triggerRefresh()
          }}
        />
      )}

      {selectedItem && (
        <ItemDetailPage
          item={selectedItem}
          onBack={() => setSelectedItem(null)}
          onClose={() => setSelectedItem(null)}
          onEdit={(item) => {
            setSelectedItem(null)
            setItemFormTarget(item)
          }}
          onDeleted={() => {
            setSelectedItem(null)
            triggerRefresh()
          }}
        />
      )}

      {heroFormTarget && (
        <HeroFormPage
          initialData={heroFormTarget.id ? heroFormTarget : null}
          onBack={() => setHeroFormTarget(null)}
          onClose={() => setHeroFormTarget(null)}
          onSaved={() => {
            setHeroFormTarget(null)
            triggerRefresh()
          }}
        />
      )}

      {itemFormTarget && (
        <ItemFormPage
          initialData={itemFormTarget.id ? itemFormTarget : null}
          onBack={() => setItemFormTarget(null)}
          onClose={() => setItemFormTarget(null)}
          onSaved={() => {
            setItemFormTarget(null)
            triggerRefresh()
          }}
        />
      )}

      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </div>
  )
}
