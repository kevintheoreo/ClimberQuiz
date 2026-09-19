/**
 * Maps archetype id -> mascot asset filename under /public/mascots/.
 * Mascots are plain static files,
 * not artwork assembled from code, so a replacement is a drop-in file swap:
 * add the new file to public/mascots/, update the filename here if it differs,
 * no component changes needed.
 */
export const MASCOT_MANIFEST: Record<string, string> = {
  'crimp-goblin': 'crimp-goblin.png',
  'slab-philosopher': 'slab-philosopher.png',
  'campus-ape': 'campus-ape.png',
  'beta-scientist': 'beta-scientist.png',
  'project-addict': 'project-addict.png',
  'sloper-specialist': 'sloper-specialist.png',
  'dyno-gremlin': 'dyno-gremlin.png',
  'chill-climber': 'chill-climber.png',
  'grade-goblin': 'grade-goblin.png',
  'movement-nerd': 'movement-nerd.png',
  'rest-day-warrior': 'rest-day-warrior.png',
  'sandbagger-supreme': 'sandbagger-supreme.png',
}

export function mascotSrc(archetypeId: string): string {
  const filename = MASCOT_MANIFEST[archetypeId]
  return `/mascots/${filename ?? `${archetypeId}.png`}`
}
