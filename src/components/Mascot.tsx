import { mascotSrc } from '../mascots/mascotManifest'

interface MascotProps {
  archetypeId: string
  name: string
  size?: number
  static?: boolean
}

function Mascot({ archetypeId, name, size = 160, static: isStatic = false }: MascotProps) {
  return (
    <img
      className={'mascot' + (isStatic ? ' mascot-static' : '')}
      src={mascotSrc(archetypeId)}
      width={size}
      height={size}
      alt={name}
    />
  )
}

export default Mascot
