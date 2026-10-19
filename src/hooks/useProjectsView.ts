// Remembers whether the visitor last browsed projects as a grid or a list.

import { useEffect, useState } from 'react'
import type { ProjectView } from '@/components/projects/ProjectList'

const STORAGE_KEY = 'launchpad-projects-view'

export function useProjectsView(): [ProjectView, (view: ProjectView) => void] {
  const [view, setView] = useState<ProjectView>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'list' ? 'list' : 'grid'
    } catch {
      return 'grid'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, view)
    } catch {
      // A browser blocking site data is not a reason to break the page.
    }
  }, [view])

  return [view, setView]
}
