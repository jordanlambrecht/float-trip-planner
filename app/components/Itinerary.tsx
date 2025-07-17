import Link from "next/link"

const Itinerary = () => {
  return (
    <section className='w-full h-auto flex flex-col items-center justify-center p-4 sm:p-6'>
      <div className='p-6  grow w-full max-w-4xl rounded-lg shadow-2xl border border-background-dm  '>
        <div className='my-6 py-4 mx-4 px-2 md:mx-8 md:px-4 flex flex-col md:flex-row items-start justify-between gap-4'>
          <div>
            <h2>Itinerary</h2>
          </div>
          <div className='flex flex-col gap-y-12 max-w-xl'>
            {/* BONUS DAY */}
            <div>
              <h3 className='mb-2 text-pink-dark'>
                Bonus Day: Merritt Reservoir (AUG 21)
              </h3>
              <p className='max-w-lg font-mono mb-4'>
                Merritt Reservoir continuously ranks in the top five of the
                darkest place on planet Earth. The trip lines up perfectly with
                multiple meteor showers.
              </p>
              <p className='max-w-lg font-mono mb-4'>
                This day is optional since it falls outside of the weekend and
                some people don&apos;t want to camp that long.
              </p>
              <p className='max-w-lg font-mono mb-4'>
                As always, totally optional, but this is the night we&apos;ll be
                taking 🍄🍄🍄 and contemplating our place in the universe and/or
                our own mortality.
              </p>
              <p className='max-w-lg font-mono mb-4'>
                There&apos;s a beach, so bring your swimmies.
              </p>
              <ul className='font-mono'>
                <li>
                  <span className='font-bold'>— Arrival:</span> Whenever. Most
                  likely mid afternoon.
                </li>
                <li>
                  <span className='font-bold'>— Activities:</span> Whatever.
                </li>
                <li>
                  <span className='font-bold'>— Today&apos;s Food:</span> Dinner
                  + Breakfast the next morning before leaving.
                </li>
              </ul>
            </div>
            {/* DAY 01 */}
            <div>
              <h3 className='mb-2 text-blue-dark'>
                Day 01 (AUG 22): Arrival + Dinner + Hangs
              </h3>
              <p className='max-w-lg font-mono mb-4'>
                Arrive at the campsite, set up tents, and get settled in. We
                will have a group dinner and hang out around the fire
              </p>
              <p className='max-w-lg font-mono mb-4'>
                We will be camping at the same site as last year. It is a
                private site with a large area for tents, a fire pit, and a
                picnic table
              </p>
              <ul className='font-mono'>
                <li>
                  <span className='font-bold'>— Arrival:</span> Whenever. Most
                  likely early to mid afternoon
                </li>
                <li>
                  <span className='font-bold'>— Activities:</span> Whatever
                </li>
                <li>
                  <span className='font-bold'>—Today&apos;s Food:</span> Snacks
                  + Dinner + Weed
                </li>
              </ul>
            </div>
            {/* DAY 02 */}
            <div>
              <h3 className='mb-2 text-teal-dark'>Day 02 (AUG 23): Float</h3>
              <p className='max-w-lg font-mono mb-4'>Self-Explanatory.</p>

              <ul className='font-mono'>
                <li>
                  <span className='font-bold'>— Today&apos;s Food:</span> Brekky
                  + Snacks + Dinner + Sunscreen
                </li>
                <li>
                  <span className='font-bold'>— Wakeup Call:</span> 08:00
                </li>
                <li>
                  <span className='font-bold'>— Breakfast:</span> Until 09:00
                </li>
                <li>
                  <span className='font-bold'>— Depart for Float:</span> 09:30
                </li>
                <li>
                  <span className='font-bold'>— Float:</span> 09:50
                </li>
                <li>
                  <span className='font-bold'>— Disembark:</span> 17:00 PM
                </li>
                <li>
                  <span className='font-bold'>— Dinner:</span> Like around 18:30
                </li>
                <li>
                  <span className='font-bold'>— Hang Out:</span> Whenever
                </li>
              </ul>
            </div>
            {/* DAY 03 */}
            <div>
              <h3 className='mb-2 text-purple-dark'>
                Day 03 (AUG 24): Departure
              </h3>
              <p className='max-w-lg font-mono mb-4'>
                We&apos;ll start packing up camp and make breakfast before
                heading home
              </p>

              <ul className='font-mono'>
                <li>
                  <span className='font-bold'>— Today&apos;s Food:</span> Brekky
                  (Probably leftovers turned into breakfast burritos) + Snacks
                </li>
                <li>
                  <span className='font-bold'>— Wakeup Call:</span> Morning
                </li>
                <li>
                  <span className='font-bold'>— Breakfast:</span> Around 09:30
                </li>
                <li>
                  <span className='font-bold'>— Hangout and/or Pack:</span>{" "}
                  Whenever
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Itinerary
