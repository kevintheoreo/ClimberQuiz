Absolutely. I’d design it so the questions feel like climbing culture, while the scoring quietly maps answers to archetypes. The user should never feel like they're being “tested”; they should feel like they're discovering which climbing gremlin lives inside them.

1. The 12 archetypes

#	Archetype	Core personality	Natural enemy

01	🐒 Crimp Goblin	Finger-strength addict, loves tiny holds	Big slopers
02	🧘 Slab Philosopher	Precise, patient, trusts feet	Overhangs
03	🦍 Campus Ape	Powerful, explosive, skips the feet	Technical slab
04	🧠 Beta Scientist	Analyzes everything before committing	Surprise moves
05	💀 Project Addict	Will spend an entire session on one move	Giving up
06	🐍 Sloper Specialist	Somehow makes friction work	Tiny crimps
07	🚀 Dyno Gremlin	Sees jumping as a legitimate climbing technique	Static movement
08	🦥 Chill Climber	Here for vibes, friends and a good session	Grade obsession
09	🏆 Grade Goblin	Grades are personal	Anything below their max
10	🧗 Movement Nerd	Loves beautiful, creative movement	Ugly beta
11	🛋️ Rest-Day Warrior	Talks about training more than actually training	Training
12	👑 Sandbagger Supreme	Claims they're weak, then casually destroys the problem	Being believed


I'd make the last one relatively difficult to obtain because "Sandbagger Supreme" is inherently funny as a rare result.


---

2. The 10-question quiz

Each question has four or five possible answers conceptually, but I'd actually use four options in the UI to keep it fast.

The important thing: don't show which archetype each answer corresponds to.


---

Q1 — New problem

You walk into the gym and see a brand-new problem. What do you do?

A. Get on immediately. Figure it out while climbing.
B. Stand there and study the holds first.
C. Look for the smallest hold and wonder if it's climbable.
D. Watch someone else climb it first.

Scoring dimensions:

A → Dyno Gremlin / Project Addict

B → Beta Scientist / Movement Nerd

C → Crimp Goblin / Grade Goblin

D → Beta Scientist / Slab Philosopher



---

Q2 — You fall on the same move

You've fallen off the same move five times. What's your next move?

A. Try it again. I'm definitely getting it this time.
B. Change the beta. There has to be another way.
C. Rest. Then try it properly.
D. "Okay, this problem is obviously badly set."

A → Project Addict

B → Movement Nerd / Beta Scientist

C → Chill Climber / Slab Philosopher

D → Grade Goblin / Sandbagger



---

Q3 — Your favourite hold

Which hold would you happily see more of?

A. Tiny crimps
B. Big slopers
C. Huge jugs
D. Weird volumes and funky shapes

A → Crimp Goblin

B → Sloper Specialist

C → Campus Ape / Grade Goblin

D → Movement Nerd



---

Q4 — The beta debate

Your friend shows you beta that is completely different from yours.

A. "Interesting. Let me try it."
B. "No way. My beta is better."
C. Immediately start analyzing both versions.
D. "I'll just do whatever feels fun."

A → Movement Nerd

B → Grade Goblin / Sandbagger

C → Beta Scientist

D → Chill Climber



---

Q5 — The scary move

You're on a highball and the next move feels sketchy.

A. Commit. You're already up there.
B. Find a more secure foot position first.
C. Look around for another beta.
D. Climb back down. Today is not the day.

A → Campus Ape / Dyno Gremlin

B → Slab Philosopher

C → Beta Scientist

D → Chill Climber



---

Q6 — Your climbing session

What does a perfect climbing session look like?

A. Sending a new personal best
B. Finally sending a problem I've been projecting
C. Trying lots of interesting movement
D. Climbing with friends and having a great time

A → Grade Goblin

B → Project Addict

C → Movement Nerd

D → Chill Climber



---

Q7 — The impossible hold

The setter gives you a hold that looks physically impossible to grip.

A. Crimp it harder.
B. Find the exact body position that makes it work.
C. Use momentum.
D. Somehow slap it and hope.

A → Crimp Goblin

B → Sloper Specialist / Slab Philosopher

C → Dyno Gremlin

D → Campus Ape



---

Q8 — Training

Someone asks what you're training right now.

A. Finger strength
B. Technique and footwork
C. Power
D. "Training? I just climb."

A → Crimp Goblin

B → Slab Philosopher / Movement Nerd

C → Campus Ape

D → Chill Climber / Rest-Day Warrior



---

Q9 — You flash something hard

You unexpectedly flash a hard problem. What happens next?

A. Immediately look for something harder.
B. Pretend it wasn't that hard.
C. Analyze exactly why it worked.
D. Celebrate with everyone.

A → Grade Goblin

B → Sandbagger Supreme

C → Beta Scientist

D → Chill Climber


This is one of the most important questions for identifying the Sandbagger.


---

Q10 — The final question

Be honest. What's your biggest climbing weakness?

A. I rely on strength too much.
B. I overthink everything.
C. I keep trying when I should rest.
D. I probably care too much about the grade.

A → Campus Ape / Crimp Goblin

B → Beta Scientist

C → Project Addict / Rest-Day Warrior

D → Grade Goblin



---

3. The scoring algorithm

I wouldn't simply do:

> A = Crimp Goblin



because then people can predict their result.

Instead, give every answer points toward multiple hidden personality dimensions.

Use six dimensions:

POWER
TECHNIQUE
ANALYSIS
COMMITMENT
CHAOS
GRADE_EGO

Each answer gives between 0–3 points to 2–3 dimensions.

For example:

Q7A — "Crimp it harder"

POWER      +3
COMMITMENT +1
TECHNIQUE  -1

Q7B — "Find the exact body position"

TECHNIQUE  +3
ANALYSIS   +2
POWER      -1

Q7C — "Use momentum"

CHAOS      +3
POWER      +2

Q7D — "Slap it and hope"

CHAOS      +3
COMMITMENT +2
ANALYSIS   -2

Do this for all 40 answers.


---

4. Then calculate the archetype

Each archetype has its own ideal personality vector.

For example:

Crimp Goblin

POWER       80
TECHNIQUE   45
ANALYSIS    35
COMMITMENT  75
CHAOS       30
GRADE_EGO   65

Slab Philosopher

POWER       25
TECHNIQUE   95
ANALYSIS    75
COMMITMENT  60
CHAOS       20
GRADE_EGO   35

Dyno Gremlin

POWER       75
TECHNIQUE   40
ANALYSIS    20
COMMITMENT  85
CHAOS       100
GRADE_EGO   50

Chill Climber

POWER       40
TECHNIQUE   50
ANALYSIS    25
COMMITMENT  30
CHAOS       55
GRADE_EGO   15

Then calculate the distance between the user's score and each archetype.

The closest archetype wins.

This has two benefits:

1. The result feels surprisingly personalized.


2. You can display the underlying stats.




---

5. Add a secondary "climbing aura"

This is something I'd add because it makes the results more interesting.

After determining the main archetype, calculate a second characteristic:

Your Climbing Aura

POWER

TECHNIQUE

CHAOS

BRAIN

GRIT

VIBES


Example:

> 🐒 CRIMP GOBLIN

Climbing Aura: GRIT

You may not have the strongest session, but you will absolutely try the move 17 more times.



This means two people can both get Crimp Goblin but have slightly different results.


---

6. Result-card copy

The result card needs to be much shorter than the full result page.

I'd make the Instagram Story version roughly:

WHAT KIND OF CLIMBER ARE YOU?

🐒 CRIMP GOBLIN

"Why use the jug when
there's a 2mm crimp?"

POWER      █████████░
GRIT       ██████████
TECHNIQUE  █████░░░░░
VIBES      ████░░░░░░

Favourite hold:
Tiny crimp

Natural habitat:
Steep overhang

Climbing weakness:
Your fingers aren't invincible.

climbertype.comAnd each archetype gets its own copy.


---

7. The 12 result cards

🐒 CRIMP GOBLIN

> "If it fits three fingers, it's a jug."



Favourite hold: Tiny crimp
Natural habitat: Steep overhang
Climbing superpower: Finger strength
Fatal weakness: Slopers


---

🧘 SLAB PHILOSOPHER

> "The wall isn't steep. Your mind is."



Favourite hold: Anything you can barely touch
Natural habitat: Slab
Climbing superpower: Footwork
Fatal weakness: Roof problems


---

🦍 CAMPUS APE

> "Feet are optional."



Favourite hold: Jugs
Natural habitat: Overhang
Climbing superpower: Raw power
Fatal weakness: Technical slab


---

🧠 BETA SCIENTIST

> "Wait. I have a theory."



Favourite hold: Whatever the beta requires
Natural habitat: Under the wall, analyzing
Climbing superpower: Problem solving
Fatal weakness: Actually starting the problem


---

💀 PROJECT ADDICT

> "One more go."



Favourite hold: The hold you keep falling off
Natural habitat: Same problem, 90 minutes later
Climbing superpower: Persistence
Fatal weakness: Knowing when to stop


---

🐍 SLOPER SPECIALIST

> "Trust the friction."



Favourite hold: The one everyone else hates
Natural habitat: Vertical wall
Climbing superpower: Open-hand strength
Fatal weakness: Tiny crimps


---

🚀 DYNO GREMLIN

> "If you can't reach it, jump."



Favourite hold: The next hold
Natural habitat: Anything requiring momentum
Climbing superpower: Explosiveness
Fatal weakness: Static climbing


---

🦥 CHILL CLIMBER

> "Grades are temporary. Good vibes are forever."



Favourite hold: Whatever feels nice
Natural habitat: The social area
Climbing superpower: Having fun
Fatal weakness: Training plans


---

🏆 GRADE GOBLIN

> "What grade is it?"



Favourite hold: The finishing hold
Natural habitat: The hardest problem in the gym
Climbing superpower: Competition
Fatal weakness: Seeing an easier climb


---

🧗 MOVEMENT NERD

> "That beta was disgusting."



Favourite hold: Weird volumes
Natural habitat: Anything with creative movement
Climbing superpower: Body awareness
Fatal weakness: Ugly beta


---

🛋️ REST-DAY WARRIOR

> "Recovery is part of training."



Favourite hold: The couch
Natural habitat: Watching climbing videos
Climbing superpower: Knowing exactly what they should train
Fatal weakness: Actually doing it


---

👑 SANDBAGGER SUPREME

> "I'm honestly not that strong."



Favourite hold: Whatever happens to be on the wall
Natural habitat: "Just warming up"
Climbing superpower: Making hard climbs look casual
Fatal weakness: Admitting their grade


---

8. The full result screen

After the share card, give them a more detailed page:

> 🐒 You're a CRIMP GOBLIN

Your climbing aura: GRIT

You don't necessarily need a better beta.

You need stronger fingers and questionable decision-making.

Your stats

💪 Power — 82%
🦶 Technique — 47%
🧠 Beta Brain — 38%
🔥 Grit — 94%
🌀 Chaos — 31%
🏆 Grade Ego — 71%

Your climbing profile

Favourite terrain: 30°+
Favourite hold: Crimp
Preferred beta: Pull harder
Rest strategy: What's resting?

Your climbing villain

The Slab Philosopher 🧘

They don't understand why you're pulling so hard.

You don't understand why they're standing there.

You're fundamentally incompatible.



That last section is potentially very shareable because people will start comparing themselves with their climbing friends.


---

9. Add "Climber Compatibility"

This could be your second viral mechanic.

At the bottom:

> Find your climbing partner

Your ideal partner:

🧘 Slab Philosopher

You provide the strength. They provide the feet.

Together, you somehow finish the problem.



And:

[Share my result]

[Find my climbing partner →]

Eventually you could have:

> Crimp Goblin + Slab Philosopher = 94% compatible



That creates a natural reason for people to send the quiz to their climbing partner.


---

10. The most important product decision

I would not launch with payment.

Launch with:

Quiz → Result → Beautiful share card → Share → Friend takes quiz

Track:

quiz starts

quiz completions

result types

share-card downloads

share button clicks

result-link visits

repeat attempts


Then you can see whether the concept actually has legs.

If people naturally share it, then add monetisation.

And I'd make the entire visual identity revolve around the 12 climbing characters. If those characters are distinctive enough, eventually the site could feel like a little collection/game rather than just another personality quiz.