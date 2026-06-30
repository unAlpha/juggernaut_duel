import wave
import math
import struct
import random

def save_wav(filename, samples, sample_rate=44100):
    with wave.open(filename, 'w') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sample_rate)
        # normalize
        max_val = max(0.01, max(abs(s) for s in samples))
        normalized = [int(s / max_val * 32767) for s in samples]
        data = struct.pack('<' + ('h' * len(normalized)), *normalized)
        w.writeframes(data)

def generate_slash():
    # Fast swish
    sr = 44100
    duration = 0.2
    samples = []
    for i in range(int(sr * duration)):
        t = i / sr
        env = math.exp(-t * 20) * math.sin(t * math.pi / duration)
        noise = random.uniform(-1, 1)
        # basic bandpass-ish by smoothing
        samples.append(noise * env * 0.5)
    
    # Smooth it to make it sound like a swish
    for _ in range(5):
        for i in range(1, len(samples)-1):
            samples[i] = (samples[i-1] + samples[i] + samples[i+1])/3
            
    return samples

def generate_hit():
    # Sharp metallic hit
    sr = 44100
    duration = 0.2
    samples = []
    freqs = [1200, 2450, 3120, 5200]
    for i in range(int(sr * duration)):
        t = i / sr
        env = math.exp(-t * 30)
        val = sum(math.sin(2 * math.pi * f * t) for f in freqs)
        noise = random.uniform(-1, 1) * math.exp(-t * 50)
        samples.append((val + noise) * env)
    return samples

def generate_crit():
    # Heavy metallic ring + thud
    sr = 44100
    duration = 0.8
    samples = []
    freqs = [2100, 3400, 5200, 8100]
    for i in range(int(sr * duration)):
        t = i / sr
        # Metal ring
        ring_env = math.exp(-t * 5)
        ring = sum(math.sin(2 * math.pi * f * t) for f in freqs) * ring_env
        
        # Heavy thud
        thud_env = math.exp(-t * 15)
        thud = math.sin(2 * math.pi * 100 * t) * thud_env
        
        noise = random.uniform(-1, 1) * math.exp(-t * 20)
        
        samples.append(ring * 0.4 + thud * 1.5 + noise * 0.5)
    return samples

def generate_dodge():
    # generic swoosh
    sr = 44100
    duration = 0.2
    samples = []
    for i in range(int(sr * duration)):
        t = i / sr
        env = math.exp(-t * 15) * math.sin(t * math.pi / duration)
        noise = random.uniform(-1, 1)
        samples.append(noise * env)
        
    for _ in range(10):
        for i in range(1, len(samples)-1):
            samples[i] = (samples[i-1] + samples[i] + samples[i+1])/3
            
    return samples

save_wav('sounds/slash.wav', generate_slash())
save_wav('sounds/hit.wav', generate_hit())
save_wav('sounds/crit.wav', generate_crit())
save_wav('sounds/dodge.wav', generate_dodge())
print("WAV files generated successfully.")
