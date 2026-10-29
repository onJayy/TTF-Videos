"""Generates the owned TTF sound kit into public/sfx (run: python3 tools/make_sfx.py).
All sounds are synthesised here, so there are no licensing issues."""
import os, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve
SR = 44100
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'sfx')
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)
T = lambda n: np.arange(n) / SR
filt = lambda x, k, f: sosfilt(butter(2, f, k, fs=SR, output='sos'), x)
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
def save(name, x, peak=0.9):
    x = np.asarray(x, float)
    if x.ndim == 1: x = np.stack([x, x], 1)
    x = x / (np.abs(x).max() + 1e-9) * peak
    sf.write(os.path.join(OUT, name), x, SR)
def ding(f, dec=7.0, n=0.9):
    n = int(SR * n); t = T(n)
    return (np.sin(2*np.pi*f*t) + 0.5*np.sin(2*np.pi*2*f*t)*np.exp(-t*9) + 0.25*np.sin(2*np.pi*3.01*f*t)*np.exp(-t*14)) * np.exp(-t*dec) * np.minimum(t/0.0015, 1)
def kick():
    n = int(SR*0.35); t = T(n); f = 45 + 75*np.exp(-t*36)
    return np.tanh(np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t*9) * 1.4)
def noise_sweep(d, f0, f1):
    n = int(SR*d); x = rng.normal(0, 1, n); o = np.zeros(n); k = 24; seg = n // k
    for j in range(k):
        f = f0 * (f1/f0) ** (j/(k-1)); a, b = j*seg, min(n, (j+1)*seg + 400)
        o[a:b] += filt(x[a:b], 'bandpass', [max(40, f*0.6), min(f*1.6, 20000)]) * np.hanning(b-a)
    return o
# rising dings (pentatonic) for counters / correct answers
PENT = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26]
for i, s in enumerate(PENT):
    save(f'ding_{i:02d}.wav', ding(mtof(72 + s)), 0.8)
# slot / roulette click
n = int(SR*0.04); t = T(n)
save('click.wav', filt(rng.normal(0, 1, n), 'bandpass', [1800, 6500])*np.exp(-t*170) + 0.6*np.sin(2*np.pi*2300*t)*np.exp(-t*130), 0.7)
# clock tick
n = int(SR*0.06); t = T(n)
save('tick.wav', np.sin(2*np.pi*3200*t)*np.exp(-t*90) + 0.5*filt(rng.normal(0, 1, n), 'highpass', 4000)*np.exp(-t*140), 0.6)
# landing hit: kick + bright chord + sparkle
n = int(SR*1.6); t = T(n); hit = np.zeros(n); k = kick(); hit[:len(k)] += k
for m in [72, 76, 79, 84]:
    hit += 0.18*np.sin(2*np.pi*mtof(m)*t)*np.exp(-t*2.6)*np.minimum(t/0.004, 1)
hit += 0.25*filt(rng.normal(0, 1, n), 'highpass', 5000)*np.exp(-t*7)
save('land.wav', hit, 0.9)
# correct: two-note up chime
c = np.zeros(int(SR*0.9)); a = ding(mtof(84), 7, 0.9); b = ding(mtof(91), 7, 0.9)
c += a; j = int(0.07*SR); c[j:] += b[:len(c)-j]*0.9
save('correct.wav', c, 0.8)
# wrong: soft low buzz down
n = int(SR*0.38); t = T(n); f = 220*np.exp(-t*1.4)
w = np.sign(np.sin(2*np.pi*np.cumsum(f)/SR))*0.5 + np.sin(2*np.pi*np.cumsum(f)/SR)
save('wrong.wav', filt(w, 'lowpass', 1600)*np.exp(-t*5)*np.minimum(t/0.004, 1), 0.6)
# whooshes and riser
save('whoosh.wav', noise_sweep(0.55, 400, 8000)*np.sin(np.pi*np.linspace(0, 1, int(SR*0.55)))**1.3, 0.7)
save('whoosh_down.wav', noise_sweep(1.1, 8000, 300)*np.sin(np.pi*np.linspace(0, 1, int(SR*1.1)))**1.3, 0.7)
r = noise_sweep(2.4, 300, 7000)*np.linspace(0, 1, int(SR*2.4))**2
save('riser.wav', r, 0.6)
# score slam
n = int(SR*1.2); t = T(n); s = np.zeros(n); k = kick(); s[:len(k)] += k*1.2
s += 0.3*filt(rng.normal(0, 1, n), 'highpass', 2500)*np.exp(-t*10)
for m in [60, 64, 67, 72]: s += 0.12*np.sin(2*np.pi*mtof(m)*t)*np.exp(-t*2)
save('slam.wav', s, 0.9)
# --- music bed: owned amapiano-style groove, 112 BPM, 32 s ---
D = 32.0; N = int(SR*D); BPM = 112; B = 60/BPM; S16 = B/4; SW = 0.17
mix = np.zeros(N)
def add(t0, x, g):
    i = int(t0*SR)
    if i >= N: return
    x = x[:N-i]; mix[i:i+len(x)] += x*g
def logdrum(m, dur=0.42):
    n = int(SR*dur); t = T(n); f0 = mtof(m); f = f0*(1+1.6*np.exp(-t*55))
    body = np.sin(2*np.pi*np.cumsum(f)/SR) + 0.35*np.sin(2*np.pi*np.cumsum(2*f)/SR)*np.exp(-t*12)
    return filt(np.tanh(body*np.exp(-t*5.5)*2.2), 'lowpass', 2200)*np.minimum(t/0.002, 1)
def shaker(a): n = int(SR*0.07); t = T(n); return filt(rng.normal(0, 1, n), 'bandpass', [5000, 11000])*np.exp(-t*70)*a
def rhodes(m, dur):
    n = int(SR*dur); t = T(n); f = mtof(m)
    return (np.sin(2*np.pi*f*t+0.6*np.sin(2*np.pi*f*t)*np.exp(-t*8)) + 0.25*np.sin(2*np.pi*2*f*t)*np.exp(-t*4))*np.minimum(t/0.003, 1)*np.exp(-t*1.8)
def pad(ms, dur):
    n = int(SR*dur); t = T(n); s = np.zeros(n)
    for m in ms:
        for d in (-0.08, 0.08): s += np.sin(2*np.pi*mtof(m+d)*t + rng.uniform(0, 6))
    return s/(2*len(ms))*np.clip(np.minimum(t/0.6, (dur-t)/0.5), 0, 1)
CH = [[65, 69, 72, 76, 79], [64, 67, 71, 74], [62, 65, 69, 72, 76], [64, 67, 71, 74, 76]]; ROOT = [41, 40, 38, 36]
LOG = [0, 3, 6, 10, 11, 14]; LOFF = [0, 0, 7, 0, 12, 0]; ACC = [1, .35, .6, .35]*4
t0 = 0.0; bar = 0
while t0 < D:
    c = bar % 4; add(t0, pad(CH[c], 4*B+0.5), 0.35)
    for st in range(16):
        tt = t0 + st*S16 + (SW*S16 if st % 2 else 0)
        if st % 4 == 0: add(tt, kick(), 0.7)
        add(tt, shaker(ACC[st]), 0.25)
        if st in LOG: k = LOG.index(st); add(tt, logdrum(ROOT[c]+12+LOFF[k]), 0.45)
        if st in (2, 6, 9, 13):
            for m in CH[c]: add(tt, rhodes(m, 0.5), 0.07)
    t0 += 4*B; bar += 1
n = int(SR*1.2); ir = filt(rng.normal(0, 1, n)*np.exp(-T(n)*4), 'lowpass', 6000)/80
mix = mix + fftconvolve(mix, ir)[:N]*0.35
mix = filt(mix, 'highpass', 30)
save('music_bed.wav', mix, 0.8)
print('sfx written to', os.path.abspath(OUT))
