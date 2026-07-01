import { TRIP_COORDS } from '@tripConfig'
import { H2 } from './ui/Typography'

// Embedded VirtualSky planetarium (virtualsky.lco.global - free, no API key)
// pinned to the sky over Merritt Reservoir on the trip's Saturday night,
// around the time the moon sets and the Milky Way takes over.
// NOTE: hand-built query string on purpose - VirtualSky reads query values
// raw (no percent-decoding), so the colons in `clock` must stay literal or
// its `new Date()` call returns Invalid Date.
const STAR_CHART_PARAMS = [
  `longitude=${TRIP_COORDS.lon}`,
  `latitude=${TRIP_COORDS.lat}`,
  'clock=2026-08-22T23:00:00',
  'projection=stereo',
  'constellations=true',
  'constellationlabels=true',
  'showplanets=true',
  'showdate=true',
  'az=180',
].join('&')

const StarChart = () => {
  return (
    <section className='w-full h-auto flex flex-col items-center justify-center p-4 sm:p-6'>
      <div className='p-6 flex-col grow w-full max-w-4xl rounded-lg shadow-2xl border border-background-dm bg-cardbg'>
        <H2>Night Sky Preview</H2>
        <p className='font-mono text-sm text-gray-textlight mb-6 max-w-xl'>
          The sky over Merritt Reservoir on Saturday night (Aug 22, ~11 PM),
          facing south.
        </p>

        <div className='w-full overflow-hidden rounded-lg border border-background-dm'>
          <iframe
            src={`https://virtualsky.lco.global/embed/index.html?${STAR_CHART_PARAMS}`}
            title='Star chart for Merritt Reservoir on trip night'
            className='w-full h-105 border-0'
            loading='lazy'
          />
        </div>
      </div>
    </section>
  )
}

export default StarChart
