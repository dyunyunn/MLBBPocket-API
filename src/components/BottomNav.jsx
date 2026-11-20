import { Swords, Shield, User } from 'lucide-react'

export default function BottomNav({ activeTab, onChangeTab }) {
  const navItems = [
    { id: 'heroes', label: 'Heroes', icon: Swords },
    { id: 'items', label: 'Items', icon: Shield },
    { id: 'profile', label: 'Profile', icon: User },
  ]

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = activeTab === item.id
        return (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onChangeTab(item.id)}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}