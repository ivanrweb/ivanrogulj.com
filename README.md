# ivanrogulj.com 👋

Personal portfolio focused on audio programming — browser-based synthesizers, guitar effects, JUCE plugins, and music tools built with modern web technologies.

Live at **[ivanrogulj.com](https://ivanrogulj.com)**.

Also available at **[soundionic.com](https://soundionic.com)** — a dedicated space for all my audio projects, accessible as a standalone brand separate from the personal portfolio.

---

## Tech Stack

**Frontend:** Angular · NgRx · Web Audio API · Web MIDI API   
**Backend:** NestJS · TypeORM · MySQL  
**Monorepo:** Nx

---

## Projects

### 🎹 Analog Synthesizer

Polyphonic synthesizer running entirely in the browser via Web Audio API. Features oscillators, ADSR envelopes, a resonant filter, LFO modulation, a step sequencer, real-time effects chain, and full MIDI controller support.

### 🎸 Guitar Pedalboard

Real-time guitar effects processor that captures live audio input. Drag-and-drop pedalboard with distortion, chorus, delay, and reverb — all implemented as custom Web Audio nodes.

### 🔌 VST Audio Plugins

Downloadable VST/AU plugins for desktop DAWs, built with the JUCE C++ framework.

### 🎼 Chord Transposer

Tool for musicians to transpose chord charts and detect song keys — useful for quick key adjustments when adjusting songs to your singing range or playing with other musicians.

### 📝 Blog

Articles about audio programming and web development, synced with my Medium feed: https://medium.com/@ivan.rogulj92

---

## Architecture

```
apps/
  frontend/       Angular SSR app
  backend/        NestJS REST API

libs/
  frontend/
    domain/       Feature libs (analog-synth, guitar-pedals, chord-changer, juce-project-list)
    shared/ui/    Reusable component library (knob, envelope, effects-rack, …)
  backend/
    domain/       NestJS domain modules
  shared/
    data-access/  Shared TypeScript interfaces (frontend ↔ backend)
```
