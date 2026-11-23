import { useState, useEffect } from 'react'
import BottomNav from './components/BottomNav'
import HeroesPage from './pages/HeroesPage'
import HeroDetailPage from './pages/HeroDetailPage'
import HeroFormPage from './pages/HeroFormPage'
import ItemsPage from './pages/ItemsPage'
import ItemDetailPage from './pages/ItemDetailPage'
import ItemFormPage from './pages/ItemFormPage'
import FavoritesPage from './pages/FavoritesPage'
import TrashPage from './pages/TrashPage'
import ProfilePage from './pages/ProfilePage'

export default function App() {
  const [activeTab, setActiveTab] = useState('heroes')
  const [selectedHero, setSelectedHero] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [heroFormMode, setHeroFormMode] = useState(null)
  const [itemFormMode, setItemFormMode] = useState(null)

  const [favHeroIds, setFavHeroIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mlbb_fav_heroes')) || []
    } catch {
      return []
    }
  })

  const [favItemIds, setFavItemIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mlbb_fav_items')) || []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('mlbb_fav_heroes', JSON.stringify(favHeroIds))
  }, [favHeroIds])

  useEffect(() => {
    localStorage.setItem('mlbb_fav_items', JSON.stringify(favItemIds))
  }, [favItemIds])

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

  const handleChangeTab = (tab) => {
    setActiveTab(tab)
    setSelectedHero(null)
    setSelectedItem(null)
    setHeroFormMode(null)
    setItemFormMode(null)
  }

  return (
    <div className="app-shell">
      <main className="main-content">
        {/* HEROES FLOW */}
        {activeTab === 'heroes' && heroFormMode && (
          <HeroFormPage
            initialData={heroFormMode === 'edit' ? selectedHero : null}
            onBack={() => setHeroFormMode(null)}
            onSaved={(savedHero) => {
              if (heroFormMode === 'edit') setSelectedHero(savedHero)
              setHeroFormMode(null)
            }}
          />
        )}
        {activeTab === 'heroes' && !heroFormMode && !selectedHero && (
          <HeroesPage
            onSelectHero={setSelectedHero}
            onAddHero={() => setHeroFormMode('create')}
            favHeroIds={favHeroIds}
            onToggleFavHero={toggleFavHero}
          />
        )}
        {activeTab === 'heroes' && !heroFormMode && selectedHero && (
          <HeroDetailPage
            hero={selectedHero}
            onBack={() => setSelectedHero(null)}
            onEdit={() => setHeroFormMode('edit')}
            onDeleted={() => setSelectedHero(null)}
          />
        )}

        {/* ITEMS FLOW */}
        {activeTab === 'items' && itemFormMode && (
          <ItemFormPage
            initialData={itemFormMode === 'edit' ? selectedItem : null}
            onBack={() => setItemFormMode(null)}
            onSaved={(savedItem) => {
              if (itemFormMode === 'edit') setSelectedItem(savedItem)
              setItemFormMode(null)
            }}
          />
        )}
        {activeTab === 'items' && !itemFormMode && !selectedItem && (
          <ItemsPage
            onSelectItem={setSelectedItem}
            onAddItem={() => setItemFormMode('create')}
            favItemIds={favItemIds}
            onToggleFavItem={toggleFavItem}
          />
        )}
        {activeTab === 'items' && !itemFormMode && selectedItem && (
          <ItemDetailPage
            item={selectedItem}
            onBack={() => setSelectedItem(null)}
            onEdit={() => setItemFormMode('edit')}
            onDeleted={() => setSelectedItem(null)}
          />
        )}

        {/* FAVORITES */}
        {activeTab === 'favorites' && (
          <FavoritesPage
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
        )}

        {/* TRASH */}
        {activeTab === 'trash' && <TrashPage />}

        {/* PROFILE */}
        {activeTab === 'profile' && <ProfilePage />}
      </main>

      <BottomNav activeTab={activeTab} onChangeTab={handleChangeTab} />
    </div>
  )
}
