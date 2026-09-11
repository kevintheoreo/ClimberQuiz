import type { ArchetypeContent } from './archetype'
import beteScientist from './beta-scientist.json'
import campusApe from './campus-ape.json'
import chillClimber from './chill-climber.json'
import crimpGoblin from './crimp-goblin.json'
import dynoGremlin from './dyno-gremlin.json'
import gradeGoblin from './grade-goblin.json'
import movementNerd from './movement-nerd.json'
import projectAddict from './project-addict.json'
import restDayWarrior from './rest-day-warrior.json'
import sandbaggerSupreme from './sandbagger-supreme.json'
import slabPhilosopher from './slab-philosopher.json'
import sloperSpecialist from './sloper-specialist.json'

export const ARCHETYPES: ArchetypeContent[] = [
  crimpGoblin,
  slabPhilosopher,
  campusApe,
  beteScientist,
  projectAddict,
  sloperSpecialist,
  dynoGremlin,
  chillClimber,
  gradeGoblin,
  movementNerd,
  restDayWarrior,
  sandbaggerSupreme,
] as ArchetypeContent[]

export const ARCHETYPES_BY_ID: Record<string, ArchetypeContent> = Object.fromEntries(
  ARCHETYPES.map((archetype) => [archetype.id, archetype]),
)
