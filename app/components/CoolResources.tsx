import Link from "next/link"

const CoolResources = () => {
  return (
    <section className='w-full h-auto flex flex-col items-center justify-center p-4 sm:p-6'>
      <div className='p-6  grow w-full max-w-4xl rounded-lg shadow-2xl border border-background-dm  '>
        <div className='my-6 py-4 mx-8 px-4 flex flex-col md:flex-row items-start justify-between gap-4'>
          <div>
            <h2>Cool Resources</h2>
          </div>
          <div>
            <ul className='underline'>
              <li>
                <Link href='https://www.timeanddate.com/moon/phases/@7317387'>
                  Moon phase chart →
                </Link>
              </li>
              <li>
                <Link href='https://www.cleardarksky.com/clmt/c/WNSGNEct.html'>
                  Clear Sky Chart →
                </Link>
              </li>
              <li>
                <Link href='https://www.amsmeteors.org/meteor-showers/meteor-shower-calendar/'>
                  2025 Meteor Shower Calendar →
                </Link>
              </li>
              <li>
                <Link href='https://weatherspark.com/y/5292/Average-Weather-in-Valentine-Nebraska-United-States-Year-Round'>
                  Climate Averages for Valentine Nebraska →
                </Link>
              </li>
              <li>
                <Link href='https://www.usclimatedata.com/climate/valentine/nebraska/united-states/usne0494'>
                  National Climate Data →
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CoolResources
