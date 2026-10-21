"""Original soundtrack for the ClimberType stats reel, synthesized from scratch with numpy.

    python3 reel/music.py      # -> reel/out/music.wav (36s, 44.1kHz stereo)

120 BPM in F major, one bar = 2s, so every scene cut in reel.js lands on a bar line.
The arrangement follows the story:

  bars  0-1   0-4s   Intro    playful marimba arpeggios, the counter rolls up to 2,782
  bars  2-3   4-8s   Cast     bouncy groove, one marimba note per mascot pop
  bars  4-5   8-12s  Rarest   drums drop out, sneaky minor-key pizzicato + tick-tock
  bars  6-8  12-18s  Ranks    build: rising blip per leaderboard row, snare roll, riser
  bars  9-12 18-26s  Podium   the drop: full chorus with the lead hook, crash on the #1 reveal
  bars 13-14 26-30s  Where    lighter half-time travel groove with bells
  bars 15-17 30-36s  Outro    hook returns, slot-machine ticks, final chord rings out

Cue times mirror reel.js; keep both files in sync when retiming anything.
"""

from pathlib import Path
import wave

import numpy as np

SR = 44100
BPM = 120
BEAT = 60 / BPM
BAR = 4 * BEAT
DUR = 36.0
N = int(DUR * SR)
rng = np.random.default_rng(2782)


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tarr(d):
    return np.arange(int(d * SR)) / SR


def at(bar, beat=0.0):
    return bar * BAR + beat * BEAT


def adsr(n, dur, a=0.005, d=0.1, s=0.7, r=0.1):
    t = np.arange(n) / SR
    a = min(a, dur * 0.5)
    d = max(1e-4, min(d, dur - a))
    return np.interp(t, [0, a, a + d, max(a + d, dur), dur + r], [0, 1, s, s, 0])


def declick(x, ms=4):
    k = min(len(x) // 2, int(SR * ms / 1000))
    if k:
        ramp = np.linspace(0, 1, k)
        x[:k] *= ramp
        x[-k:] *= ramp[::-1]
    return x


def fft_filter(x, lo=None, hi=None, slope=1.2):
    """Smooth band filter in the frequency domain (fine for one-shot buffers)."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR) + 1e-9
    g = np.ones_like(f)
    if lo:
        g *= 1 / (1 + (lo / f) ** (2 * slope))
    if hi:
        g *= 1 / (1 + (f / hi) ** (2 * slope))
    return np.fft.irfft(X * g, len(x))


def noise(d):
    return rng.standard_normal(int(d * SR))


# ------------------------------------------------------------ instruments --

def marimba(m, vel=1.0, dur=0.9):
    f = mtof(m)
    t = tarr(dur)
    x = (np.sin(2 * np.pi * f * t) * np.exp(-t * 5.5)
         + 0.32 * np.sin(2 * np.pi * 3.93 * f * t) * np.exp(-t * 20)
         + 0.08 * np.sin(2 * np.pi * 9.4 * f * t) * np.exp(-t * 40))
    return declick(x * vel * np.minimum(1, t / 0.0015))


def glock(m, vel=1.0, dur=2.2):
    f = mtof(m)
    t = tarr(dur)
    x = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * k)
            for r, a, k in [(1, 1, 2.0), (2.76, 0.45, 4.5), (5.40, 0.22, 8), (8.93, 0.1, 12)])
    return declick(x * vel * np.minimum(1, t / 0.001))


def epiano(m, dur, vel=1.0):
    """Two-operator FM electric piano."""
    f = mtof(m)
    n = int((dur + 0.5) * SR)
    t = np.arange(n) / SR
    idx = 1.4 * np.exp(-t * 4) + 0.25
    x = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * t))
    x += 0.15 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 3)
    x *= 1 + 0.08 * np.sin(2 * np.pi * 4.5 * t)
    return declick(x * adsr(n, dur, 0.004, 0.9, 0.45, 0.45) * vel)


def pad(m, dur, vel=1.0, bright=0.72):
    """Soft detuned-saw pad built additively (band-limited by construction)."""
    f = mtof(m)
    n = int((dur + 0.8) * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for cents in (-8, 0, 8):
        fd = f * 2 ** (cents / 1200)
        for h in range(1, 12):
            if fd * h > 9000:
                break
            x += (bright ** h / h) * np.sin(2 * np.pi * fd * h * t + rng.uniform(0, 2 * np.pi))
    return declick(x * adsr(n, dur, 0.35, 0.6, 0.8, 0.8) * vel / 3)


def bass(m, dur, vel=1.0):
    f = mtof(m)
    n = int((dur + 0.08) * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t) + 0.1 * np.sin(6 * np.pi * f * t)
    x = np.tanh(1.6 * x) / np.tanh(1.6)
    x += 0.4 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 30)  # pluck
    return declick(x * adsr(n, dur, 0.004, 0.18, 0.7, 0.07) * vel)


def lead(m, dur, vel=1.0):
    """Soft retro pulse lead with delayed vibrato (Retro Arcade identity)."""
    f0 = mtof(m)
    n = int((dur + 0.15) * SR)
    t = np.arange(n) / SR
    vib = 0.22 * np.minimum(1, np.maximum(0, t - 0.18) / 0.25) * np.sin(2 * np.pi * 5.5 * t)
    phase = 2 * np.pi * np.cumsum(f0 * 2 ** (vib / 12)) / SR
    x = np.zeros(n)
    for h in range(1, 10):
        if f0 * h > 10000:
            break
        a = (1 if h % 2 else 0.35) / h * 0.85 ** h
        x += a * np.sin(h * phase)
    x = x * adsr(n, dur, 0.012, 0.25, 0.75, 0.15)
    x[: len(marimba(m + 12, 0.25, dur))] += marimba(m + 12, 0.25, dur)[:n]
    return declick(x * vel)


def woodblock(m, vel=1.0):
    f = mtof(m)
    t = tarr(0.15)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 50) + 0.4 * np.sin(2 * np.pi * 2.7 * f * t) * np.exp(-t * 80)
    return declick(x * vel)


def kick(vel=1.0):
    t = tarr(0.5)
    f = 52 + 120 * np.exp(-t * 30)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
    x = np.tanh(1.8 * x)
    x += 0.25 * fft_filter(noise(0.5), 1500, 6000) * np.exp(-t * 250)
    return declick(x * vel)


def snare(vel=1.0):
    t = tarr(0.32)
    tone = 0.5 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 22)
    nz = fft_filter(noise(0.32), 1400, 9000) * np.exp(-t * 15) * 0.55
    return declick((tone + nz) * vel)


def clap(vel=1.0):
    t = tarr(0.35)
    nz = fft_filter(noise(0.35), 900, 5500)
    env = sum(np.where(t >= o, np.exp(-(t - o) * 160), 0) for o in (0, 0.011, 0.022))
    env += np.where(t >= 0.03, 0.6 * np.exp(-(t - 0.03) * 13), 0)
    return declick(nz * env * 0.5 * vel)


def hat(vel=1.0, open_=False):
    d = 0.45 if open_ else 0.08
    t = tarr(d)
    return declick(fft_filter(noise(d), 7000) * np.exp(-t * (9 if open_ else 65)) * 0.5 * vel)


def shaker(vel=1.0):
    t = tarr(0.09)
    env = np.minimum(1, t / 0.015) * np.exp(-t * 45)
    return declick(fft_filter(noise(0.09), 4500, 11000) * env * 0.3 * vel)


def crash(vel=1.0):
    t = tarr(3.0)
    x = fft_filter(noise(3.0), 3500) * np.exp(-t * 1.5) * 0.35
    x += fft_filter(noise(3.0), 800, 3500) * np.exp(-t * 6) * 0.15
    return declick(x * vel)


def boom(vel=1.0):
    t = tarr(1.6)
    f = 44 + 50 * np.exp(-t * 9)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.5) * 0.7
    x += fft_filter(noise(1.6), 40, 400) * np.exp(-t * 8) * 0.3
    return declick(np.tanh(1.4 * x) * vel)


def svf_sweep(x, f0, f1, q=0.6):
    """State-variable band-pass whose centre glides exponentially from f0 to f1."""
    n = len(x)
    fc = f0 * (f1 / f0) ** (np.arange(n) / n)
    g = 2 * np.sin(np.pi * fc / SR)
    lp = bp = 0.0
    out = np.empty(n)
    for i in range(n):
        hp = x[i] - lp - q * bp
        bp += g[i] * hp
        lp += g[i] * bp
        out[i] = bp
    return out


def whoosh(d=0.6):
    t = tarr(d)
    env = np.sin(np.pi * np.minimum(1, t / d)) ** 2
    return declick(svf_sweep(noise(d), 400, 5000) * env * 0.5)


def riser(d):
    t = tarr(d)
    env = (t / d) ** 2.2
    x = svf_sweep(noise(d), 300, 7000, q=0.4) * 0.5
    x += 0.25 * np.sin(2 * np.pi * np.cumsum(200 * 2 ** (3 * t / d)) / SR)
    return declick(x * env)


def slide_whistle(f0, f1, d):
    t = tarr(d)
    f = f0 * (f1 / f0) ** (t / d) * (1 + 0.01 * np.sin(2 * np.pi * 7 * t))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.15 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    return declick(x * np.sin(np.pi * t / d) ** 0.5 * 0.5)


# ------------------------------------------------------------------ mixer --

BUSES = ['drums', 'bass', 'music', 'lead', 'fx']
mix = {b: np.zeros((2, N)) for b in BUSES}
kick_times = []


def add(bus, t0, sig, gain=1.0, pan=0.0):
    i = int(round(t0 * SR))
    if i >= N or i + len(sig) <= 0:
        return
    s = sig[max(0, -i): N - i]
    i = max(0, i)
    a = (pan + 1) * np.pi / 4
    mix[bus][0, i:i + len(s)] += s * gain * np.cos(a)
    mix[bus][1, i:i + len(s)] += s * gain * np.sin(a)


def k(t0, vel=1.0):
    kick_times.append(t0)
    add('drums', t0, kick(vel), 0.7)


CHORDS = {  # voicings near middle C, plus a bass root
    'F': ([53, 57, 60, 65], 41), 'C': ([52, 55, 60, 64], 36), 'Dm': ([50, 53, 57, 62], 38),
    'Bb': ([50, 53, 58, 62], 34), 'A7': ([49, 52, 55, 57], 45), 'Gm7': ([50, 53, 55, 58], 43),
}


def chord_pad(t0, name, dur, vel=0.5, bright=0.72):
    for i, m in enumerate(CHORDS[name][0]):
        add('music', t0, pad(m, dur, vel, bright), 0.22, -0.4 + i * 0.27)


def chord_keys(t0, name, dur, vel=0.6):
    for i, m in enumerate(CHORDS[name][0]):
        add('music', t0 + i * 0.006, epiano(m + 12, dur, vel), 0.16, 0.25 - i * 0.15)


BOUNCE = [(0, 0.8, 0), (1.5, 0.4, 0), (2, 0.4, 12), (2.5, 0.4, 0), (3, 0.4, 7), (3.5, 0.4, 0)]


def bass_bounce(bar, name, vel=1.0):
    root = CHORDS[name][1]
    for b, d, iv in BOUNCE:
        add('bass', at(bar, b), bass(root + iv, d * BEAT, vel), 0.36)


def groove(bar, kick_beats=(0, 1, 2, 3), clap_beats=(1, 3), hats='8off', shake=True, vel=1.0):
    for b in kick_beats:
        k(at(bar, b), vel)
    for b in clap_beats:
        add('drums', at(bar, b), clap(vel), 0.55, 0.05)
        add('drums', at(bar, b), snare(vel * 0.6), 0.35)
    if hats == '8off':
        for b in np.arange(0.5, 4, 1):
            add('drums', at(bar, b), hat(vel, open_=True), 0.3, 0.3)
        for b in np.arange(0, 4, 1):
            add('drums', at(bar, b), hat(vel * 0.6), 0.3, 0.3)
    elif hats == '16':
        for j, b in enumerate(np.arange(0, 4, 0.25)):
            add('drums', at(bar, b), hat(vel * (1 if j % 2 else 0.55)), 0.3, 0.3)
    if shake:
        for j, b in enumerate(np.arange(0, 4, 0.25)):
            add('drums', at(bar, b), shaker(vel * (1 if j % 4 == 2 else 0.6)), 0.4, -0.35)


def melody(bar, notes, vel=1.0, octave=0):
    for b, d, m in notes:
        add('lead', at(bar, b), lead(m + octave, d * BEAT * 0.92, vel), 0.34, 0.08)


HOOK = [  # chorus lead, one list per bar (beat, length in beats, midi)
    [(0, 1, 69), (1, 0.5, 72), (1.5, 1, 77), (2.5, 0.5, 76), (3, 1, 72)],
    [(0, 1, 76), (1, 0.5, 74), (1.5, 0.5, 72), (2, 1.5, 67), (3.5, 0.5, 69)],
    [(0, 1, 74), (1, 0.5, 77), (1.5, 1, 81), (2.5, 0.5, 79), (3, 1, 77)],
    [(0, 1, 74), (1, 0.5, 72), (1.5, 0.5, 70), (2, 2, 72)],
]

# ------------------------------------------------------------ arrangement --

# Intro (0-4s): marimba arpeggios, counter lands with a bell on 2.5s.
ARP = {'F': [65, 69, 72, 77, 72, 69, 72, 69], 'C': [64, 67, 72, 76, 72, 67, 72, 67]}
for bar, name in [(0, 'F'), (1, 'C')]:
    for j, m in enumerate(ARP[name]):
        add('music', at(bar, j * 0.5), marimba(m, 1.0 if j % 2 == 0 else 0.7), 0.3, -0.25 if j % 2 else 0.25)
    chord_keys(at(bar), name, BAR, 0.5)
for j, b in enumerate(np.arange(0, 4, 0.25)):
    add('drums', at(0, b), shaker(0.5 + 0.5 * (j % 4 == 2)), 0.35, -0.35)
for t0 in (0.5, 0.75, 1.0):  # mascots pop in
    add('fx', t0, marimba(84 + int(4 * (t0 - 0.5) / 0.25), 0.6), 0.22, 0.3)
groove(1, kick_beats=(0, 2), hats='8off', vel=0.85)
bass_bounce(1, 'C', 0.9)
add('fx', 2.5, glock(89, 0.9), 0.3, -0.2)
add('fx', 2.5, glock(93, 0.7), 0.25, 0.2)
add('drums', 2.5, crash(0.45), 0.5, 0.4)

# Cast (4-8s): bouncy groove; one rising pentatonic marimba note per mascot pop.
for bar, name in [(2, 'Dm'), (3, 'Bb')]:
    groove(bar, kick_beats=(0, 2, 2.5), hats='8off')
    bass_bounce(bar, name)
    chord_pad(at(bar), name, BAR, 0.35)
    for b in (0.5, 1.5, 2.5, 3.5):
        chord_keys(at(bar, b), name, 0.2, 0.55)
PENTA = [65, 67, 69, 72, 74, 77, 79, 81, 84, 86, 89, 91]
for i, m in enumerate(PENTA):
    add('fx', 4.25 + i * 0.25, marimba(m, 0.85), 0.32, -0.4 + 0.07 * i)

# Rarest (8-12s): drums out, sneaky chromatic pizzicato, tick-tock, low minor pad.
chord_pad(at(4), 'Dm', BAR, 0.45, bright=0.55)
chord_pad(at(5), 'A7', BAR, 0.45, bright=0.55)
SNEAK = [(4, 0, 50), (4, 1, 52), (4, 1.5, 53), (4, 2.5, 56), (4, 3, 57),
         (5, 0, 57), (5, 1, 56), (5, 1.5, 55), (5, 2, 54), (5, 2.5, 53), (5, 3, 52), (5, 3.5, 49)]
for bar, b, m in SNEAK:
    add('bass', at(bar, b), bass(m - 12, 0.18, 0.9), 0.42)
    add('music', at(bar, b), marimba(m + 12, 0.6, 0.4), 0.22, 0.2)
for bar in (4, 5):
    for b in range(4):
        add('drums', at(bar, b), woodblock(84 if b % 2 == 0 else 79, 0.7), 0.25, -0.5 if b % 2 else 0.5)
add('fx', 8.5, slide_whistle(1300, 380, 0.4), 0.25)
add('drums', 8.9, boom(0.6), 0.5)
add('drums', 8.9, kick(0.8), 0.6)
add('drums', 9.5, boom(0.9), 0.6)
add('fx', 9.5, glock(74, 0.8), 0.3)
add('fx', 9.5, glock(81, 0.6), 0.25)
add('drums', 11.0, clap(1.0), 0.7)
add('drums', 11.0, kick(0.9), 0.6)
add('drums', 11.0, snare(0.8), 0.4)

# Ranks (12-18s): the build. One rising blip per leaderboard row, then roll + riser.
for bar, name in [(6, 'Bb'), (7, 'C'), (8, 'C')]:
    chord_pad(at(bar), name, BAR if bar < 8 else BAR * 0.85, 0.4)
    root = CHORDS[name][1]
    for b in np.arange(0, 4 if bar < 8 else 3.5, 0.5):
        add('bass', at(bar, b), bass(root + (12 if b % 1 else 0), 0.4 * BEAT, 0.85), 0.36)
groove(6, kick_beats=(0, 1, 2, 3), clap_beats=(), hats='8off', shake=False, vel=0.8)
groove(7, hats='16', shake=False, vel=0.9)
groove(8, kick_beats=(0, 1), hats='16', shake=False)
RISE = [65, 67, 69, 70, 72, 74, 76, 77, 79]
for j, m in enumerate(RISE):
    add('fx', 12.5 + j * 0.5, marimba(m, 0.9), 0.3, 0.2)
    add('fx', 12.5 + j * 0.5, glock(m + 12, 0.4), 0.12, -0.2)
roll = list(np.arange(17.0, 17.5, 0.125)) + list(np.arange(17.5, 17.75, 0.0625))
for j, t0 in enumerate(roll):
    add('drums', t0, snare(0.4 + 0.6 * j / len(roll)), 0.45)
add('fx', 16.0, riser(1.75), 0.35)

# Podium (18-26s): the drop. Full chorus with the hook.
add('drums', 18.0, crash(1.0), 0.6)
add('drums', 18.0, boom(0.8), 0.5)
for i, name in enumerate(['F', 'C', 'Dm', 'Bb']):
    bar = 9 + i
    groove(bar, hats='8off')
    bass_bounce(bar, name)
    chord_pad(at(bar), name, BAR, 0.45)
    for b in (0.5, 1.5, 2.5, 3.5):
        chord_keys(at(bar, b), name, 0.25, 0.6)
    melody(bar, HOOK[i])
add('fx', 18.75, glock(81, 0.8), 0.3, 0.4)  # #3
add('fx', 20.25, glock(84, 0.8), 0.3, -0.4)  # #2
add('drums', 22.0, crash(1.0), 0.6)  # #1
add('drums', 22.0, boom(1.0), 0.55)
for j, m in enumerate([77, 81, 84, 89, 93, 96]):
    add('fx', 22.0 + j * 0.0625, glock(m, 0.7), 0.22, -0.5 + j * 0.2)

# Where (26-30s): lighter half-time travel groove with bells.
for bar, name in [(13, 'Gm7'), (14, 'C')]:
    groove(bar, kick_beats=(0, 2.5), clap_beats=(2,), hats='none', vel=0.8)
    add('bass', at(bar), bass(CHORDS[name][1], 1.4 * BEAT, 0.9), 0.36)
    add('bass', at(bar, 2.5), bass(CHORDS[name][1] + 7, 1.2 * BEAT, 0.8), 0.36)
    chord_pad(at(bar), name, BAR, 0.4)
    chord_keys(at(bar), name, BAR, 0.5)
BELLS = [(13, [79, 77, 74, 70]), (14, [76, 72, 67, 64])]
for bar, ms in BELLS:
    for j, b in enumerate(np.arange(0, 4, 0.5)):
        add('music', at(bar, b), glock(ms[j % 4], 0.35, 1.2), 0.16, 0.4 - 0.2 * (j % 4))
for j, m in enumerate([84, 81, 77, 74]):  # country stamps
    add('fx', 26.25 + j * 0.5, glock(m, 0.7), 0.25, 0.3)
    add('drums', 26.25 + j * 0.5, woodblock(72, 0.5), 0.2, -0.3)

# Outro (30-36s): hook returns, slot-machine ticks, final chord rings out.
groove(15, hats='8off')
bass_bounce(15, 'F')
chord_pad(at(15), 'F', BAR, 0.45)
for b in (0.5, 1.5, 2.5, 3.5):
    chord_keys(at(15, b), 'F', 0.25, 0.6)
melody(15, HOOK[0])
chord_pad(at(16), 'Bb', BAR / 2, 0.45)
chord_pad(at(16, 2), 'C', BAR / 2, 0.45)
k(at(16), 0.8)
k(at(16, 2), 0.8)
add('bass', at(16), bass(34, 1.8 * BEAT), 0.36)
add('bass', at(16, 2), bass(36, 1.8 * BEAT), 0.36)
melody(16, [(0, 1, 74), (1, 0.5, 72), (1.5, 0.5, 70), (2, 1, 72), (3, 1, 76)])
t0, dt = 30.3, 0.07  # same schedule as SPIN in reel.js
while t0 < 33.7:
    add('fx', t0, woodblock(91, 0.6), 0.22, 0.3)
    t0 += dt
    dt *= 1.11
add('fx', 33.0, riser(1.0), 0.25)
LAND = 34.0
add('drums', LAND, crash(1.0), 0.6)
add('drums', LAND, boom(0.9), 0.55)
k(LAND, 1.0)
add('bass', LAND, bass(41, 1.8), 0.36)
for i, m in enumerate(CHORDS['F'][0]):
    add('music', LAND, pad(m, 1.6, 0.5), 0.24, -0.4 + i * 0.27)
    add('music', LAND + i * 0.03, epiano(m + 12, 1.6, 0.7), 0.18)
add('lead', LAND, lead(77, 1.4, 1.0), 0.24)
for j, m in enumerate([77, 81, 84, 89]):
    add('fx', LAND + j * 0.08, glock(m, 0.6), 0.22, -0.3 + j * 0.2)

# Screenprint wipes between scenes (reel.js CUTS): a whoosh peaking as the panel covers.
for cut in (4, 8, 12, 18, 26, 30):
    add('fx', cut - 0.3, whoosh(0.6), 0.3)

# ----------------------------------------------------------------- master --


def sidechain(depth=0.45, release=0.12):
    g = np.ones(N)
    span = int(0.5 * SR)
    curve = 1 - depth * np.exp(-np.arange(span) / SR / release)
    for t0 in kick_times:
        i = int(t0 * SR)
        j = min(N, i + span)
        g[i:j] = np.minimum(g[i:j], curve[: j - i])
    return g


def reverb(x, seconds=2.2, decay=3.0, seed=0):
    r = np.random.default_rng(seed)
    t = tarr(seconds)
    ir = r.standard_normal(len(t)) * np.exp(-t * decay)
    ir = fft_filter(ir, 120, 6500)
    ir = np.concatenate([np.zeros(int(0.018 * SR)), ir])
    ir /= np.sqrt(np.sum(ir ** 2))
    size = 1 << int(np.ceil(np.log2(len(x) + len(ir))))
    return np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[: len(x)]


sc = sidechain()
mix['bass'] *= sc
mix['music'] *= 0.4 + 0.6 * sc

send = mix['music'] * 0.35 + mix['lead'] * 0.4 + mix['fx'] * 0.35 + mix['drums'] * 0.06
wet = np.stack([reverb(send[0], seed=1), reverb(send[1], seed=2)]) * 0.55

out = sum(mix[b] for b in BUSES) + wet
out = np.stack([fft_filter(ch, lo=38, slope=2) for ch in out])
out = np.tanh(out * 1.1 / np.max(np.abs(out)) * 1.6) / np.tanh(1.6 * 1.1)
fade = np.ones(N)
fade[-int(1.2 * SR):] = np.linspace(1, 0, int(1.2 * SR)) ** 2
out *= fade * 0.93 / np.max(np.abs(out))

dest = Path(__file__).parent / 'out' / 'music.wav'
dest.parent.mkdir(exist_ok=True)
with wave.open(str(dest), 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((out.T * 32767).astype('<i2').tobytes())

for name, a, b in [('intro', 0, 4), ('cast', 4, 8), ('rarest', 8, 12), ('ranks', 12, 18),
                   ('podium', 18, 26), ('where', 26, 30), ('outro', 30, 36)]:
    seg = out[:, int(a * SR): int(b * SR)]
    print(f'{name:7s} rms {20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-9):6.1f} dBFS')
print(dest)
