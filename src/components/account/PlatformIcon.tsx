// Compact platform marks inherit the current theme and accompany accessible text labels.

const LETTERS: Record<string, string> = {
  linkedin: 'in',
  x: '𝕏',
  gitlab: 'GL',
  leetcode: '〈/〉',
  stackoverflow: '≋',
  devto: 'DEV',
  behance: 'Bē',
  dribbble: '◉',
}

export function PlatformIcon({ platform }: { platform: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      {platform === 'github' ? (
        <path
          fill="currentColor"
          stroke="none"
          d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.86c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.99 1.03-2.69-.1-.26-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03a9.6 9.6 0 0 1 5 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.39.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.69-4.58 4.94.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"
        />
      ) : platform === 'instagram' ? (
        <>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
        </>
      ) : platform === 'youtube' ? (
        <>
          <rect x="2" y="5" width="20" height="14" rx="4" />
          <path d="m10 9 5 3-5 3Z" fill="currentColor" />
        </>
      ) : platform === 'discord' ? (
        <>
          <path d="M7 5 4 6 2 17l5 2 1-2h8l1 2 5-2-2-11-3-1-1 2H8Z" />
          <circle cx="8" cy="12" r="1.5" fill="currentColor" />
          <circle cx="16" cy="12" r="1.5" fill="currentColor" />
        </>
      ) : LETTERS[platform] ? (
        <text
          x="12"
          y="16"
          textAnchor="middle"
          stroke="none"
          fill="currentColor"
          fontSize={platform === 'devto' ? '9' : '15'}
          fontWeight="800"
        >
          {LETTERS[platform]}
        </text>
      ) : (
        <>
          <circle cx="12" cy="12" r="9" />
          <ellipse cx="12" cy="12" rx="4" ry="9" />
          <path d="M3 12h18M5 7h14M5 17h14" />
        </>
      )}
    </svg>
  )
}
