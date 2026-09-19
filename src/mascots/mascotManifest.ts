/**
 * Maps archetype id -> mascot asset filename under /public/mascots/.
 * Mascots are plain static files (matching the repo's favicon.svg convention),
 * not artwork assembled from code, so a replacement is a drop-in file swap:
 * add the new file to public/mascots/, update the filename here if it differs,
 * no component changes needed.
 */
export const MASCOT_MANIFEST: Record<string, string> = {
  'crimp-goblin': 'crimp-goblin.svg',
  'slab-philosopher': 'slab-philosopher.svg',
  'campus-ape': 'campus-ape.svg',
  'beta-scientist': 'beta-scientist.svg',
  'project-addict': 'project-addict.svg',
  'sloper-specialist': 'sloper-specialist.svg',
  'dyno-gremlin': 'dyno-gremlin.svg',
  'chill-climber': 'chill-climber.svg',
  'grade-goblin': 'grade-goblin.svg',
  'movement-nerd': 'movement-nerd.svg',
  'rest-day-warrior': 'rest-day-warrior.svg',
  'sandbagger-supreme': 'sandbagger-supreme.svg',
}

export function mascotSrc(archetypeId: string): string {
  const filename = MASCOT_MANIFEST[archetypeId]
  return `/mascots/${filename ?? `${archetypeId}.svg`}`
}
