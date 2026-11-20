import { useState } from 'react'
import BottomNav from './components/BottomNav'
import HeroesPage from './pages/HeroesPage'
import HeroDetailPage from './pages/HeroDetailPage'
import ItemsPage from './pages/ItemsPage'
import ItemDetailPage from './pages/ItemDetailPage'
import ProfilePage from './pages/ProfilePage'

export default function App() {
  const [activeTab, setActiveTab] = useState('heroes')
  const [selectedHero, setSelectedHero] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)

  const handleChangeTab = (tab) => {
    setActiveTab(tab)
    setSelectedHero(null)
    setSelectedItem(null)
  }

  return (
    <div className="app-shell">
      <main className="main-content">
        {activeTab === 'heroes' && !selectedHero && (
          <HeroesPage onSelectHero={setSelectedHero} />
        )}
        {activeTab === 'heroes' && selectedHero && (
          <HeroDetailPage hero={selectedHero} onBack={() => setSelectedHero(null)} />
        )}

        {activeTab === 'items' && !selectedItem && (
          <ItemsPage onSelectItem={setSelectedItem} />
        )}
        {activeTab === 'items' && selectedItem && (
          <ItemDetailPage item={selectedItem} onBack={() => setSelectedItem(null)} />
        )}

        {activeTab === 'profile' && <ProfilePage />}
      </main>

      <BottomNav activeTab={activeTab} onChangeTab={handleChangeTab} />
    </div>
  )
}
