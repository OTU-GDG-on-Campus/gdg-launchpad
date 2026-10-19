// The keyboard modifier name for the visitor's platform, used in shortcut hints.

export function commandKeyLabel(): 'Ctrl' | '⌘' {
  const agent = navigator.userAgent
  return /Mac|iPhone|iPad|iPod/.test(agent) ? '⌘' : 'Ctrl'
}
