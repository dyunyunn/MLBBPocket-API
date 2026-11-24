import { useState, useEffect, useCallback } from 'react'
import { Swords, Shield, Heart, Trash2, User } from 'lucide-react'
import SplashScreen from './components/SplashScreen'
import HeroesPage from './pages/HeroesPage'
import HeroDetailPage from './pages/HeroDetailPage'
import HeroFormPage from './pages/HeroFormPage'
import ItemsPage from './pages/ItemsPage'
import ItemDetailPage from './pages/ItemDetailPage'
import ItemFormPage from './pages/ItemFormPage'
import FavoritesPage from './pages/FavoritesPage'
import TrashPage from './pages/TrashPage'
import ProfilePage from './pages/ProfilePage'

const FAV_HEROES_KEY = 'mlbbpocket_fav_heroes'
const FAV_ITEMS_KEY = 'mlbbpocket_fav_items'

const loadIds = (key) => {
  try {
    const raw = localStorage.getItem(key)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [activeTab, setActiveTab] = useState('heroes')
  const [selectedHero, setSelectedHero] = useState(null)
  const [editingHero, setEditingHero] = useState(null)
  const [isAddingHero, setIsAddingHero] = useState(false)

  const [selectedItem, setSelectedItem] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [isAddingItem, setIsAddingItem] = useState(false)

  const [refreshKey, setRefreshKey] = useState(0)

  const [favHeroIds, setFavHeroIds] = useState(() => loadIds(FAV_HEROES_KEY))
  const [favItemIds, setFavItemIds] = useState(() => loadIds(FAV_ITEMS_KEY))

  useEffect(() => {
    try {
      localStorage.setItem(FAV_HEROES_KEY, JSON.stringify(favHeroIds))
    } catch {
      // Abaikan jika storage penuh
    }
  }, [favHeroIds])

  useEffect(() => {
    try {
      localStorage.setItem(FAV_ITEMS_KEY, JSON.stringify(favItemIds))
    } catch {
      // Abaikan jika storage penuh
    }
  }, [favItemIds])

  const handleFinishSplash = useCallback(() => {
    setShowSplash(false)
  }, [])

  const toggleFavHero = (id) => {
    setFavHeroIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const toggleFavItem = (id) => {
    setFavItemIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const resetSubViews = () => {
    setSelectedHero(null)
    setEditingHero(null)
    setIsAddingHero(false)
    setSelectedItem(null)
    setEditingItem(null)
    setIsAddingItem(false)
  }

  const handleTabChange = (tab) => {
    resetSubViews()
    setActiveTab(tab)
  }

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const renderContent = () => {
    if (activeTab === 'heroes') {
      if (isAddingHero || editingHero) {
        return (
          <HeroFormPage
            initialData={editingHero}
            onBack={() => {
              setIsAddingHero(false)
              setEditingHero(null)
            }}
            onSaved={(savedHero) => {
              setIsAddingHero(false)
              setEditingHero(null)
              setSelectedHero(savedHero || null)
              triggerRefresh()
            }}
          />
        )
      }

      if (selectedHero) {
        return (
          <HeroDetailPage
            hero={selectedHero}
            onBack={() => setSelectedHero(null)}
            onEdit={(heroData) => setEditingHero(heroData)}
            onDeleted={() => {
              setSelectedHero(null)
              triggerRefresh()
            }}
          />
        )
      }

      return (
        <HeroesPage
          key={`heroes-${refreshKey}`}
          onSelectHero={(hero) => setSelectedHero(hero)}
          onAddHero={() => setIsAddingHero(true)}
          favHeroIds={favHeroIds}
          onToggleFavHero={toggleFavHero}
        />
      )
    }

    if (activeTab === 'items') {
      if (isAddingItem || editingItem) {
        return (
          <ItemFormPage
            initialData={editingItem}
            onBack={() => {
              setIsAddingItem(false)
              setEditingItem(null)
            }}
            onSaved={(savedItem) => {
              setIsAddingItem(false)
              setEditingItem(null)
              setSelectedItem(savedItem || null)
              triggerRefresh()
            }}
          />
        )
      }

      if (selectedItem) {
        return (
          <ItemDetailPage
            item={selectedItem}
            onBack={() => setSelectedItem(null)}
            onEdit={(itemData) => setEditingItem(itemData)}
            onDeleted={() => {
              setSelectedItem(null)
              triggerRefresh()
            }}
          />
        )
      }

      return (
        <ItemsPage
          key={`items-${refreshKey}`}
          onSelectItem={(item) => setSelectedItem(item)}
          onAddItem={() => setIsAddingItem(true)}
          favItemIds={favItemIds}
          onToggleFavItem={toggleFavItem}
        />
      )
    }

    if (activeTab === 'favorites') {
      return (
        <FavoritesPage
          key={`fav-${refreshKey}`}
          favHeroIds={favHeroIds}
          favItemIds={favItemIds}
          onToggleFavHero={toggleFavHero}
          onToggleFavItem={toggleFavItem}
          onSelectHero={(hero) => {
            setActiveTab('heroes')
            setSelectedHero(hero)
          }}
          onSelectItem={(item) => {
            setActiveTab('items')
            setSelectedItem(item)
          }}
        />
      )
    }

    if (activeTab === 'trash') {
      return <TrashPage key={`trash-${refreshKey}`} />
    }

    return <ProfilePage />
  }

  return (
    <div className="app-shell">
      {showSplash && <SplashScreen onFinish={handleFinishSplash} />}

      <main className="main-content">{renderContent()}</main>

      <nav className="bottom-nav">
        <button
          type="button"
          className={`nav-item ${activeTab === 'heroes' ? 'active' : ''}`}
          onClick={() => handleTabChange('heroes')}
        >
          <Swords size={20} />
          <span>Heroes</span>
        </button>

        <button
          type="button"
          className={`nav-item ${activeTab === 'items' ? 'active' : ''}`}
          onClick={() => handleTabChange('items')}
        >
          <Shield size={20} />
          <span>Items</span>
        </button>

        <button
          type="button"
          className={`nav-item ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => handleTabChange('favorites')}
        >
          <Heart size={20} />
          <span>Favorites</span>
        </button>

        <button
          type="button"
          className={`nav-item ${activeTab === 'trash' ? 'active' : ''}`}
          onClick={() => handleTabChange('trash')}
        >
          <Trash2 size={20} />
          <span>Trash</span>
        </button>

        <button
          type="button"
          className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => handleTabChange('profile')}
        >
          <User size={20} />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  )
}
