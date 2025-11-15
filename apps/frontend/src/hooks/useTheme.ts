import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

const applyTheme = (theme: Theme) => {
  const root = window.document.documentElement
  root.classList.remove('light', 'dark')
  
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    root.classList.add(systemTheme)
  } else {
    root.classList.add(theme)
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'
    const stored = localStorage.getItem('theme') as Theme
    return stored || 'light'
  })

  useEffect(() => {
    // Aplicar tema inicial
    applyTheme(theme)
    // Salvar no localStorage se não existir
    if (!localStorage.getItem('theme')) {
      localStorage.setItem('theme', theme)
    }
  }, [theme])

  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => applyTheme('system')

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const handleSetTheme = (newTheme: Theme) => {
    applyTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    setTheme(newTheme)
  }

  return { theme, setTheme: handleSetTheme }
}
