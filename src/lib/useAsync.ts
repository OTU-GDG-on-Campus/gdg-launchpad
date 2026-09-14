// Runs an async loader and tracks loading/error/data, ignoring results from stale calls.
// Pass a key that changes whenever the loader should re-run; it stands in for the loader's inputs.

import { useEffect, useState } from 'react'

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export function useAsync<T>(loader: () => Promise<T>, key: string): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T> & { key: string }>({
    key,
    data: null,
    loading: true,
    error: null,
  })

  // Resetting during render is cheaper than the extra render an effect would cost.
  if (state.key !== key) setState({ key, data: null, loading: true, error: null })

  useEffect(() => {
    let active = true

    loader()
      .then((data) => {
        if (active) setState({ key, data, loading: false, error: null })
      })
      .catch((error: Error) => {
        if (active) setState({ key, data: null, loading: false, error })
      })

    return () => {
      active = false
    }
    // Loader is omitted on purpose: it is a new closure each render, and key already
    // captures every input it reads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { data: state.data, loading: state.loading, error: state.error }
}
