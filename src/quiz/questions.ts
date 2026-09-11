import type { QuizQuestion } from '../types/quiz'

/**
 * Static quiz config (Phase 1: engine is content-agnostic).
 * Dimension/answer-weight scoring is layered on top in Phase 2.
 */
export const QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    prompt:
      'You walk into the gym and see a brand-new problem. What do you do?',
    answers: [
      { id: 'a', text: 'Get on immediately. Figure it out while climbing.' },
      { id: 'b', text: 'Stand there and study the holds first.' },
      { id: 'c', text: "Look for the smallest hold and wonder if it's climbable." },
      { id: 'd', text: 'Watch someone else climb it first.' },
    ],
  },
  {
    id: 'q2',
    prompt: "You've fallen off the same move five times. What's your next move?",
    answers: [
      { id: 'a', text: "Try it again. I'm definitely getting it this time." },
      { id: 'b', text: 'Change the beta. There has to be another way.' },
      { id: 'c', text: 'Rest. Then try it properly.' },
      { id: 'd', text: '"Okay, this problem is obviously badly set."' },
    ],
  },
  {
    id: 'q3',
    prompt: 'Which hold would you happily see more of?',
    answers: [
      { id: 'a', text: 'Tiny crimps' },
      { id: 'b', text: 'Big slopers' },
      { id: 'c', text: 'Huge jugs' },
      { id: 'd', text: 'Weird volumes and funky shapes' },
    ],
  },
  {
    id: 'q4',
    prompt: 'Your friend shows you beta that is completely different from yours.',
    answers: [
      { id: 'a', text: '"Interesting. Let me try it."' },
      { id: 'b', text: '"No way. My beta is better."' },
      { id: 'c', text: 'Immediately start analyzing both versions.' },
      { id: 'd', text: '"I\'ll just do whatever feels fun."' },
    ],
  },
  {
    id: 'q5',
    prompt: "You're on a highball and the next move feels sketchy.",
    answers: [
      { id: 'a', text: "Commit. You're already up there." },
      { id: 'b', text: 'Find a more secure foot position first.' },
      { id: 'c', text: 'Look around for another beta.' },
      { id: 'd', text: 'Climb back down. Today is not the day.' },
    ],
  },
  {
    id: 'q6',
    prompt: 'What does a perfect climbing session look like?',
    answers: [
      { id: 'a', text: 'Sending a new personal best' },
      { id: 'b', text: "Finally sending a problem I've been projecting" },
      { id: 'c', text: 'Trying lots of interesting movement' },
      { id: 'd', text: 'Climbing with friends and having a great time' },
    ],
  },
  {
    id: 'q7',
    prompt: 'The setter gives you a hold that looks physically impossible to grip.',
    answers: [
      { id: 'a', text: 'Crimp it harder.' },
      { id: 'b', text: 'Find the exact body position that makes it work.' },
      { id: 'c', text: 'Use momentum.' },
      { id: 'd', text: 'Somehow slap it and hope.' },
    ],
  },
  {
    id: 'q8',
    prompt: "Someone asks what you're training right now.",
    answers: [
      { id: 'a', text: 'Finger strength' },
      { id: 'b', text: 'Technique and footwork' },
      { id: 'c', text: 'Power' },
      { id: 'd', text: '"Training? I just climb."' },
    ],
  },
  {
    id: 'q9',
    prompt: 'You unexpectedly flash a hard problem. What happens next?',
    answers: [
      { id: 'a', text: 'Immediately look for something harder.' },
      { id: 'b', text: "Pretend it wasn't that hard." },
      { id: 'c', text: 'Analyze exactly why it worked.' },
      { id: 'd', text: 'Celebrate with everyone.' },
    ],
  },
  {
    id: 'q10',
    prompt: "Be honest. What's your biggest climbing weakness?",
    answers: [
      { id: 'a', text: 'I rely on strength too much.' },
      { id: 'b', text: 'I overthink everything.' },
      { id: 'c', text: 'I keep trying when I should rest.' },
      { id: 'd', text: 'I probably care too much about the grade.' },
    ],
  },
]
