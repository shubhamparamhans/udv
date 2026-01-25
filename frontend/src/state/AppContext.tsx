import { createContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { AppState } from '../types'

const initialState: AppState = {
  models: [],
  selectedModel: null,
  query: {
    filters: [],
    groupBy: [],
    sort: [],
  },
}

export const AppContext = createContext<{
  state: AppState
  setState: (state: AppState) => void
}>({ state: initialState, setState: () => {} })

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState)

  return (
    <AppContext.Provider value={{ state, setState }}>
      {children}
    </AppContext.Provider>
  )
}
