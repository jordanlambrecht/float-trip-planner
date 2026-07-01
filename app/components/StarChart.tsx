'use client'

import { useEffect, useRef } from 'react'
import { TRIP_COORDS } from '@tripConfig'
import { H2 } from './ui/Typography'

// Self-hosted VirtualSky (github.com/slowe/VirtualSky), the same south-facing
// horizon planetarium we started with, but loaded as scripts we control instead of
// a cross-origin iframe (which couldn't be scripted). We hold the returned object
// and advance its clock to time-lapse the trip's Saturday night from dusk to dawn;
// VirtualSky draws its own ticking date via showdate:true.
//
// Verified against the VirtualSky source before writing:
//  - getDir() resolves data + lang paths from the <script src*=virtualsky> tag, so
//    serving virtualsky.min.js from /virtualsky/ makes stars.json, lines_latin.json,
//    galaxy.json, virtualsky-planets.js and lang/en.json all load from /virtualsky/.
//  - setClock(dateObject) jumps to an exact instant and redraws; passing a Date
//    (not a string) sidesteps the input.clock "freeze" branch.
//  - stuquery.min.js defines window.S; virtualsky.min.js attaches S.virtualsky. Load
//    stuquery first.
//  - az:180 faces south (the Milky Way core in late-Aug evenings); the moon sets to
//    the right (west). projection:'stereo' + ground:true gives a horizon at the
//    bottom. stars rise on the left and set on the right as the clock advances.

const SCRIPTS = [
  '/virtualsky/stuquery.min.js', // defines window.S; must load first
  '/virtualsky/virtualsky.min.js', // attaches S.virtualsky; getDir() -> /virtualsky/
]

const CONTAINER_ID = 'virtualsky-map'

type Planetarium = { setClock: (d: Date) => unknown }
type StuQuery = {
  virtualsky?: (opts: Record<string, unknown>) => Planetarium
}

// Trip's Saturday night: dusk on Aug 22 through first light on Aug 23, 2026.
// CDT is UTC-5 in August; the offset is baked in so the instant is unambiguous.
const START = new Date('2026-08-22T20:30:00-05:00')
const END = new Date('2026-08-23T05:00:00-05:00')
const STEP_MIN = 2 // simulated minutes advanced per rendered frame
const FPS = 18 // redraw cadence (each step is a full canvas redraw)

// Load the two legacy global scripts in order, exactly once per page.
let scriptsPromise: Promise<void> | null = null
function loadScriptsOnce(): Promise<void> {
  if (scriptsPromise) return scriptsPromise
  scriptsPromise = SCRIPTS.reduce(
    (chain, src) =>
      chain.then(
        () =>
          new Promise<void>((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) return resolve()
            const el = document.createElement('script')
            el.src = src
            el.async = false
            el.onload = () => resolve()
            el.onerror = () => reject(new Error(`Failed to load ${src}`))
            document.body.appendChild(el)
          })
      ),
    Promise.resolve()
  )
  return scriptsPromise
}

const StarChart = () => {
  const skyRef = useRef<Planetarium | null>(null)
  const rafRef = useRef<number | null>(null)
  const initedRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    loadScriptsOnce()
      .then(() => {
        if (cancelled) return
        const S = (window as unknown as { S?: StuQuery }).S
        if (!S || !S.virtualsky) return

        // Build the planetarium once per mount (strict-mode double-invoke shares this).
        if (!initedRef.current) {
          skyRef.current = S.virtualsky({
            id: CONTAINER_ID,
            projection: 'stereo',
            az: 180, // face south
            latitude: TRIP_COORDS.lat,
            longitude: TRIP_COORDS.lon,
            magnitude: 5,
            gradient: true, // twilight glow near dusk/dawn
            ground: true, // opaque ground below the horizon
            cardinalpoints: true, // N / E / S / W labels
            showdate: true, // the ticking date/time readout
            showposition: false,
            showstars: true,
            showplanets: true,
            showplanetlabels: true,
            constellations: true, // constellation lines
            constellationlabels: true,
            showgalaxy: true, // Milky Way band (schematic outline)
            keyboard: false,
            mouse: true, // allow drag-to-look-around
            lang: 'en',
          })
          skyRef.current?.setClock(new Date(START)) // opening moment
          initedRef.current = true
        }

        const sky = skyRef.current
        if (!sky) return

        // (Re)start the dusk->dawn loop each effect invocation so strict-mode's
        // cleanup->remount cycle doesn't leave the animation stopped.
        let simMs = START.getTime()
        let last = 0
        const frameGap = 1000 / FPS
        const endMs = END.getTime()
        const startMs = START.getTime()

        const loop = (ts: number) => {
          rafRef.current = requestAnimationFrame(loop)
          if (ts - last < frameGap) return
          last = ts
          simMs += STEP_MIN * 60_000
          if (simMs > endMs) simMs = startMs // loop the night
          try {
            sky.setClock(new Date(simMs))
          } catch {
            // a stray redraw during teardown can throw; ignore
          }
        }
        rafRef.current = requestAnimationFrame(loop)
      })
      .catch((err) => console.warn('[StarChart] failed to load VirtualSky', err))

    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  return (
    <section className='w-full h-auto flex flex-col items-center justify-center p-4 sm:p-6'>
      <div className='p-6 flex-col grow w-full max-w-4xl rounded-lg shadow-2xl border border-background-dm bg-cardbg'>
        <H2>Night Sky Preview</H2>
        <p className='font-mono text-sm text-gray-textlight mb-6 max-w-xl'>
          Looking south from Merritt Reservoir, looped from dusk to dawn on
          Saturday night (Aug 22–23). Watch the moon set to the west and the
          Milky Way wheel overhead.
        </p>

        <div className='w-full overflow-hidden rounded-lg border border-background-dm'>
          <div id={CONTAINER_ID} className='w-full h-105' />
        </div>
      </div>
    </section>
  )
}

export default StarChart
