import { create } from 'zustand'

interface ThemeState {
  isDark: boolean
  toggle: () => void
}

const saved = localStorage.getItem('theme')
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const initialDark = saved ? saved === 'dark' : prefersDark

if (initialDark) document.documentElement.classList.add('dark')

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: initialDark,
  toggle: () => set(state => {
    const next = !state.isDark
    localStorage.setItem('theme', next ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', next)
    return { isDark: next }
  })
}))