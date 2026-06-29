import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import api from '../../api/axios'
import { useAuth } from '../../hooks/useAuth'
import { useThemeStore } from '../../store/theme.store'
import { Workspace } from '../../types'

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { isDark, toggle } = useThemeStore()
  const [collapsed, setCollapsed] = useState(false)

  const { data: workspaces } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => api.get('/workspaces').then(r => r.data.data as Workspace[])
  })

  return (
    <aside className={clsx(
      'flex flex-col h-screen border-r transition-all duration-200 shrink-0',
      'bg-white dark:bg-dark-50 border-gray-200 dark:border-dark-200',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 dark:border-dark-200">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">PM</span>
        </div>
        {!collapsed && <span className="font-bold text-gray-900 dark:text-white text-sm">SaaS-PM</span>}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        <NavItem icon="🏠" label="Dashboard" collapsed={collapsed}
          active={location.pathname === '/dashboard'}
          onClick={() => navigate('/dashboard')} />

        {!collapsed && workspaces && workspaces.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-400 dark:text-dark-400 uppercase tracking-wider px-2 mb-2">
              Workspaces
            </p>
            {workspaces.map(ws => (
              <NavItem
                key={ws.id}
                icon={ws.name[0].toUpperCase()}
                label={ws.name}
                collapsed={collapsed}
                active={location.pathname.includes(ws.slug)}
                onClick={() => navigate(`/workspace/${ws.slug}`)}
                isWorkspace
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-100 dark:border-dark-200 p-3 space-y-1">
        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition',
            'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-100'
          )}
        >
          <span>{isDark ? '☀️' : '🌙'}</span>
          {!collapsed && <span>{isDark ? 'Light mode' : 'Dark mode'}</span>}
        </button>

        {/* User */}
        <div className={clsx(
          'flex items-center gap-3 px-3 py-2 rounded-lg',
          'bg-gray-50 dark:bg-dark-100'
        )}>
          <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">{user?.name[0]}</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-800 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={logout} className="text-xs text-red-400 hover:text-red-500 shrink-0">Out</button>
          )}
        </div>
      </div>
    </aside>
  )
}

function NavItem({ icon, label, collapsed, active, onClick, isWorkspace }: {
  icon: string; label: string; collapsed: boolean
  active: boolean; onClick: () => void; isWorkspace?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition text-left',
        active
          ? 'bg-primary-50 dark:bg-primary-600/20 text-primary-600 dark:text-primary-400 font-medium'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-100'
      )}
    >
      <span className={clsx(
        'flex items-center justify-center shrink-0 text-xs font-bold',
        isWorkspace
          ? 'w-6 h-6 rounded-md bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400'
          : 'w-5 h-5'
      )}>
        {icon}
      </span>
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  )
}