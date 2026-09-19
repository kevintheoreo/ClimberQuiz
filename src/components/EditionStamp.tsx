import { EDITION_LABELS } from '../types/archetype'
import type { Rarity } from '../types/archetype'

interface EditionStampProps {
  rarity: Rarity
  size?: 'sm' | 'lg'
}

function EditionStamp({ rarity, size = 'sm' }: EditionStampProps) {
  const label = EDITION_LABELS[rarity]
  const lines = label.split(' / ')

  return (
    <div
      className={
        'edition-stamp' +
        (size === 'lg' ? ' edition-stamp-lg' : '') +
        (rarity === 'very-rare' ? ' edition-stamp-very-rare' : '')
      }
    >
      {lines.map((line) => (
        <span key={line} className="edition-stamp-label">
          {line}
        </span>
      ))}
    </div>
  )
}

export default EditionStamp
