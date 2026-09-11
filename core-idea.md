Yes — this is a much better fit for you than trying to build a generic productivity SaaS.

The key is to make it feel less like a “quiz website” and more like a climbing personality test + collectible/shareable result card.

The core idea

“What Kind of Climber Are You?”

User answers ~8–12 funny climbing questions, then gets a personality:

🐒 The Crimp Goblin — tiny holds? More power.

🦥 The Slab Philosopher — “You don't need strength. You need to believe.”

🦍 The Campus Ape — feet are merely suggestions.

🧘 The Beta Nerd — watches 14 people climb before touching the wall.

🐍 The Sloper Specialist — somehow grips holds that look completely unusable.

💀 The Project Addict — “One more attempt” × 47.

🧗 The Dyno Gremlin — if you can't reach it, jump harder.

☕ The Social Climber — came to climb, spent 70% of the session talking.

👻 The V5 Sandbagger — “I'm actually pretty weak” climbs V7.


You could have maybe 12–16 archetypes.


---

The viral loop is the important part

The result shouldn't simply say:

> You are a Crimp Goblin.



Instead, generate a beautiful Instagram Story-sized result card:

┌─────────────────────────┐
│                         │
│   WHAT KIND OF          │
│   CLIMBER ARE YOU?      │
│                         │
│       🐒                │
│                         │
│   CRIMP GOBLIN          │
│                         │
│   "If it doesn't hurt,  │
│    you're not crimping  │
│    hard enough."        │
│                         │
│   POWER      ████████░  │
│   FLEX       █████░░░░  │
│   PATIENCE   ██░░░░░░░  │
│   BETA       ██████░░░  │
│                         │
│   climbertype.com       │
└─────────────────────────┘

Then:

[Share to Instagram] [Save Image] [Try Again]

The person posts it to their Story.

Their friends see:

> “What kind of climber are YOU?”



and visit the site.

That's the loop.


---

I'd make the quiz itself funny

Don't ask boring questions like:

> How often do you climb?



Instead:

Question 1

You see a new problem. What's your first move?

🅰️ Immediately climb it.
🅱️ Stare at it for 30 seconds.
🅲️ Watch someone else climb it.
🅳️ “That start looks sketchy.”
🅴️ Try the hardest-looking move first.

Question 2

You fall off the same move 6 times.

🅰️ One more try.
🅱️ Change beta.
🅲️ Blame the setter.
🅳️ Rest 5 minutes.
🅴️ “Actually, I think my shoes are worn.”

Question 3

Your friend says: "Let's try something easier."

🅰️ Sure.
🅱️ What grade?
🅲️ Pretends not to hear.
🅳️ “After this attempt.”
🅴️ Starts warming up on V4.

Question 4

Which sentence sounds most like you?

> “The feet are terrible.”



> “I think there's a hidden crimp.”



> “Wait, let me try your beta.”



> “I can definitely stick that dyno.”



> “I'm just warming up.”



This makes the experience shareable and entertaining, rather than feeling like a survey.


---

Make the results more than just a name

This is where I think your app could become genuinely addictive.

Each result could have:

Your Climber Type

🐒 CRIMP GOBLIN

> You trust your fingers more than your feet, your body, or common sense.



Your stats

Finger Strength: 94%
Footwork: 38%
Commitment: 97%
Patience: 12%
Beta Obsession: 81%

Then:

Your climbing habits

Favourite hold: 🦀 Tiny crimp
Natural habitat: Overhang
Arch enemy: Slab
Rest strategy: “One more go”
Most likely to say: “I almost had it.”

And finally:

> Your toxic climbing trait:
You think every problem can be solved by pulling harder.



😂

That's the stuff people will screenshot.


---

I would also add a "rare type" system

This could make people want to retake it.

For example:

Type	Rarity

🐒 Crimp Goblin	Common
🧘 Slab Philosopher	Common
💀 Project Addict	Common
🦍 Campus Ape	Uncommon
🐍 Sloper Specialist	Uncommon
🧠 Beta Scientist	Rare
👑 Absolute Sandbagger	Very Rare
🦄 The Perfect Climber	1%


Then the result says:

> You are a Beta Scientist 🧠

Rarity: 7%

Only 7% of climbers get this result.



That gives people another reason to share.


---

The visual style matters A LOT

For this particular idea, I'd avoid a conventional modern SaaS UI.

I'd go for something like:

Japanese climbing gym × retro arcade × sticker collection

Think:

textured backgrounds

climbing holds as UI elements

cute illustrated characters

chunky typography

little animations

chalk particles

holds appearing as you progress

character animations for each result


You could even give every archetype its own character mascot.

That would make the Instagram cards much more visually recognizable.


---

One feature I'd REALLY consider

"Rate your climbing personality"

After getting their result:

> How accurate was this?



🔥 100% me

😐 Kinda

🤨 That's not me

Then:

> Challenge your friend



Generate a link:

climbertype.com/result/7x92k

When someone opens it:

> Kevin is a CRIMP GOBLIN 🐒

Think you're different?

TAKE THE QUIZ →



This turns individual shares into direct acquisition.


---

Monetisation

I wouldn't put ads everywhere.

For your goal of public + passive + no business communication, I'd make the core quiz completely free.

Then potentially:

Free

Take quiz

Get result

Share result

Basic stats


$1–3 optional extras

Something like:

"Unlock your full climbing report"

Including:

climbing personality breakdown

strengths

weaknesses

ideal climbing style

training recommendation

compatible climber types

your "climbing villain"

downloadable wallpapers

alternate result cards


Or simply:

> ☕ Buy me a chalk bag



with Ko-fi/Stripe.

The important thing is don't put the payment before the fun.


---

And this is very achievable technically

Given the kind of React/Vite apps you've been building, I'd actually keep V1 extremely small:

React + Vite
       │
       ├── Landing page
       │
       ├── Quiz engine
       │
       ├── Scoring engine
       │
       ├── Result page
       │
       ├── Share card generator
       │
       └── Analytics

You don't even need a backend initially.

Your archetypes can simply be JSON:

types/
  crimp-goblin.json
  slab-philosopher.json
  campus-ape.json
  beta-scientist.json
  project-addict.json
  social-climber.json

And the quiz scoring can happen entirely client-side.

For the Instagram card, generate a 1080 × 1920 image so it fits Stories perfectly.


---

The MVP I'd build

Don't start with 20 archetypes.

Start with:

8 archetypes × 10 questions × 1 beautiful share card.

That's enough.

The real goal isn't:

> "Build a sophisticated personality test."



It's:

> "Make something a climber will immediately want to send to their climbing friends."



If someone finishes it and thinks “HAHA this is literally me”, you've got something.

And honestly, this idea fits your previous desire to make small, playful web experiences that people can discover and share extremely well.

If you want, I can next design the **exact 10-question quiz + scoring algorithm + 12 climber archetypes + result-card copy**, so you can give the whole specification directly to Copilot/Claude Code.