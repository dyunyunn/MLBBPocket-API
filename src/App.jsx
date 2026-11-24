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

const isDeletedFlag = (val) =>
  val === true || val === 1 || String(val).toLowerCase() === 'true'

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [activeTab, setActiveTab] = useState('heroes')
  const [refreshKey, setRefreshKey] = useState(0)

  const [favHeroIds, setFavHeroIds] = useState([])
  const [favItemIds, setFavItemIds] = useState([])

  const [selectedHero, setSelectedHero] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [heroFormTarget, setHeroFormTarget] = useState(null)
  const [itemFormTarget, setItemFormTarget] = useState(null)

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1)

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const [hRes, iRes] = await Promise.all([
          apiClient.get('/heroes'),
          apiClient.get('/items'),
        ])
        setFavHeroIds(
          hRes.data
            .filter((h) => !isDeletedFlag(h.is_deleted) && Boolean(h.is_favorite))
            .map((h) => h.id)
        )
        setFavItemIds(
          iRes.data
            .filter((i) => !isDeletedFlag(i.is_deleted) && Boolean(i.is_favorite))
            .map((i) => i.id)
        )
      } catch (err) {
        console.error('Gagal mengambil data favorit dari server:', err)
      }
    }
    fetchFavorites()
  }, [refreshKey])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [activeTab, selectedHero, selectedItem, heroFormTarget, itemFormTarget])

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

  const handleTabChange = (nextTab) => {
    setSelectedHero(null)
    setSelectedItem(null)
    setHeroFormTarget(null)
    setItemFormTarget(null)
    setActiveTab(nextTab)
  }

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />
  }

  const isSubPage = Boolean(
    heroFormTarget || itemFormTarget || selectedHero || selectedItem
  )

  const renderContent = () => {
    if (heroFormTarget) {
      return (
        <HeroFormPage
          initialData={heroFormTarget.id ? heroFormTarget : null}
          hero={heroFormTarget.id ? heroFormTarget : null}
          onBack={() => setHeroFormTarget(null)}
          onClose={() => setHeroFormTarget(null)}
          onSaved={() => {
            setHeroFormTarget(null)
            triggerRefresh()
          }}
          onSuccess={() => {
            setHeroFormTarget(null)
            triggerRefresh()
          }}
        />
      )
    }

    if (itemFormTarget) {
      return (
        <ItemFormPage
          initialData={itemFormTarget.id ? itemFormTarget : null}
          item={itemFormTarget.id ? itemFormTarget : null}
          onBack={() => setItemFormTarget(null)}
          onClose={() => setItemFormTarget(null)}
          onSaved={() => {
            setItemFormTarget(null)
            triggerRefresh()
          }}
          onSuccess={() => {
            setItemFormTarget(null)
            triggerRefresh()
          }}
        />
      )
    }

    if (selectedHero) {
      return (
        <HeroDetailPage
          hero={selectedHero}
          isFavorite={favHeroIds.includes(selectedHero.id)}
          onToggleFavorite={() => handleToggleFavHero(selectedHero.id)}
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
      )
    }

    if (selectedItem) {
      return (
        <ItemDetailPage
          item={selectedItem}
          isFavorite={favItemIds.includes(selectedItem.id)}
          onToggleFavorite={() => handleToggleFavItem(selectedItem.id)}
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
      )
    }

    if (activeTab === 'heroes') {
      return (
        <HeroesPage
          key={`heroes-${refreshKey}`}
          onSelectHero={(hero) => setSelectedHero(hero)}
          onAddHero={() => setHeroFormTarget({})}
          favHeroIds={favHeroIds}
          onToggleFavHero={handleToggleFavHero}
        />
      )
    }

    if (activeTab === 'items') {
      return (
        <ItemsPage
          key={`items-${refreshKey}`}
          onSelectItem={(item) => setSelectedItem(item)}
          onAddItem={() => setItemFormTarget({})}
          favItemIds={favItemIds}
          onToggleFavItem={handleToggleFavItem}
        />
      )
    }

    if (activeTab === 'favorites') {
      return (
        <FavoritesPage
          key={`fav-${refreshKey}`}
          favHeroIds={favHeroIds}
          favItemIds={favItemIds}
          onToggleFavHero={handleToggleFavHero}
          onToggleFavItem={handleToggleFavItem}
          onSelectHero={(hero) => setSelectedHero(hero)}
          onSelectItem={(item) => setSelectedItem(item)}
        />
      )
    }

    if (activeTab === 'trash') {
      return <TrashPage key={`trash-${refreshKey}`} />
    }

    if (activeTab === 'profile') {
      return (
        <ProfilePage
          favHeroCount={favHeroIds.length}
          favItemCount={favItemIds.length}
        />
      )
    }

    return null
  }

  return (
    <div className="app-shell">
      <main
        style={{
          width: '100%',
          maxWidth: '1100px',
          margin: '0 auto',
          padding: isSubPage ? '18px 16px 36px' : '18px 16px 96px',
          boxSizing: 'border-box',
        }}
      >
        {renderContent()}
      </main>
      {!isSubPage && (
        <BottomNav
          activeTab={activeTab}
          onChangeTab={handleTabChange}
        />
      )}
    </div>
  )
}
