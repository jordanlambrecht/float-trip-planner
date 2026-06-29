'use client'

import { useState, useEffect } from 'react'
import type { HistoricalYearData } from '@types'
import { getHistoricalYearsCached } from '../lib/historicalYears'
import {
  TRIP_COORDS,
  TRIP_FORECAST_START,
  TRIP_FORECAST_END,
} from '@tripConfig'

// Open-Meteo (free, no API key) only forecasts ~16 days out, so this section
// shows a countdown until the trip dates enter the forecast window.
const FORECAST_HORIZON_DAYS = 15

interface DailyForecast {
  date: string
  tempMax: number
  tempMin: number
  feelsLikeMax: number
  uvIndex: number
  cloudCover: number
  precipChance: number
  precipAmount: number
  windMax: number
  gustMax: number
  humidity: number
  sunset: string
  weatherCode: number
}

const weatherEmoji = (code: number): string => {
  if (code === 0) return '☀️'
  if (code <= 2) return '🌤️'
  if (code === 3) return '☁️'
  if (code <= 48) return '🌫️'
  if (code <= 67) return '🌧️'
  if (code <= 77) return '🌨️'
  if (code <= 82) return '🌦️'
  return '⛈️'
}

const uvLabel = (uv: number): { label: string; className: string } => {
  if (uv < 3) return { label: 'low', className: 'text-green-700' }
  if (uv < 6) return { label: 'moderate', className: 'text-yellow-600' }
  if (uv < 8) return { label: 'high', className: 'text-orange-600' }
  if (uv < 11) return { label: 'very high', className: 'text-red-600' }
  return { label: 'extreme', className: 'text-purple-700' }
}

const dayLabel = (dateString: string): string =>
  new Date(`${dateString}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

const sunsetLabel = (iso: string): string =>
  new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

// The trip's day strings (YYYY-MM-DD), built from local date parts so there's
// no UTC-offset rollover. Used for placeholder cards before the real forecast
// window opens.
const tripDayDates = (): string[] => {
  const days: string[] = []
  const end = new Date(`${TRIP_FORECAST_END}T12:00:00`)
  const d = new Date(`${TRIP_FORECAST_START}T12:00:00`)
  while (d <= end) {
    days.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`
    )
    d.setDate(d.getDate() + 1)
  }
  return days
}

const WeatherForecast = () => {
  const [forecast, setForecast] = useState<DailyForecast[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [daysUntilWindow, setDaysUntilWindow] = useState<number | null>(null)
  const [pastYears, setPastYears] = useState<HistoricalYearData[]>([])

  useEffect(() => {
    getHistoricalYearsCached().then((result) => {
      if (Array.isArray(result)) setPastYears(result)
    })
  }, [])

  useEffect(() => {
    const tripStart = new Date(`${TRIP_FORECAST_START}T00:00:00-05:00`)
    const daysOut = Math.ceil(
      (tripStart.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )

    if (daysOut > FORECAST_HORIZON_DAYS) {
      setDaysUntilWindow(daysOut - FORECAST_HORIZON_DAYS)
      return
    }

    const params = new URLSearchParams({
      latitude: String(TRIP_COORDS.lat),
      longitude: String(TRIP_COORDS.lon),
      daily:
        'weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,uv_index_max,cloud_cover_mean,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max,relative_humidity_2m_mean,sunset',
      temperature_unit: 'fahrenheit',
      wind_speed_unit: 'mph',
      precipitation_unit: 'inch',
      timezone: 'America/Chicago',
      start_date: TRIP_FORECAST_START,
      end_date: TRIP_FORECAST_END,
    })

    fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Forecast request failed (${res.status})`)
        return res.json()
      })
      .then((data) => {
        const daily = data.daily
        const days: DailyForecast[] = daily.time.map(
          (date: string, i: number) => ({
            date,
            tempMax: Math.round(daily.temperature_2m_max[i]),
            tempMin: Math.round(daily.temperature_2m_min[i]),
            feelsLikeMax: Math.round(daily.apparent_temperature_max[i]),
            uvIndex: Math.round(daily.uv_index_max[i]),
            cloudCover: Math.round(daily.cloud_cover_mean[i]),
            precipChance: daily.precipitation_probability_max[i] ?? 0,
            precipAmount: daily.precipitation_sum[i] ?? 0,
            windMax: Math.round(daily.wind_speed_10m_max[i]),
            gustMax: Math.round(daily.wind_gusts_10m_max[i]),
            humidity: Math.round(daily.relative_humidity_2m_mean[i]),
            sunset: daily.sunset[i],
            weatherCode: daily.weather_code[i],
          })
        )
        setForecast(days)
      })
      .catch((err) => {
        console.error('Error fetching forecast:', err)
        setError("Couldn't load the forecast. The sky remains a mystery.")
      })
  }, [])

  return (
    <section className='w-full h-auto flex flex-col items-center justify-center p-4 sm:p-6'>
      <div className='p-6 flex-col grow w-full max-w-4xl rounded-lg shadow-2xl border border-background-dm bg-cardbg'>
        <h2>Trip Weather Forecast</h2>
        <p className='font-mono text-sm text-gray-textlight mb-6'>
          Valentine, NE
        </p>

        {error && <p className='font-mono text-sm text-red-600'>{error}</p>}

        {!error && (
          <>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
              {forecast
                ? forecast.map((day) => {
                    const uv = uvLabel(day.uvIndex)
                    return (
                      <div
                        key={day.date}
                        className='rounded-lg border border-background-dm p-4'
                      >
                        <div className='text-center mb-3'>
                          <p className='font-mono text-xs font-bold text-gray-textlight uppercase'>
                            {dayLabel(day.date)}
                          </p>
                          <p className='text-4xl my-1'>
                            {weatherEmoji(day.weatherCode)}
                          </p>
                          <p className='font-mono text-base font-bold text-gray-textdark'>
                            {day.tempMax}° / {day.tempMin}°
                          </p>
                          {day.feelsLikeMax !== day.tempMax && (
                            <p className='font-mono text-xs text-gray-textlight'>
                              feels like {day.feelsLikeMax}°
                            </p>
                          )}
                        </div>
                        <ul className='font-mono text-xs space-y-1 text-gray-textdark'>
                          <li className='flex justify-between'>
                            <span className='text-gray-textlight'>
                              UV index
                            </span>
                            <span className={`font-bold ${uv.className}`}>
                              {day.uvIndex} ({uv.label})
                            </span>
                          </li>
                          <li className='flex justify-between'>
                            <span className='text-gray-textlight'>Clouds</span>
                            <span>{day.cloudCover}%</span>
                          </li>
                          <li className='flex justify-between'>
                            <span className='text-gray-textlight'>Rain</span>
                            <span>
                              {day.precipChance}%
                              {day.precipAmount > 0
                                ? ` (${day.precipAmount.toFixed(2)}")`
                                : ''}
                            </span>
                          </li>
                          <li className='flex justify-between'>
                            <span className='text-gray-textlight'>Wind</span>
                            <span>
                              {day.windMax} mph (gusts {day.gustMax})
                            </span>
                          </li>
                          <li className='flex justify-between'>
                            <span className='text-gray-textlight'>
                              Humidity
                            </span>
                            <span>{day.humidity}%</span>
                          </li>
                          <li className='flex justify-between'>
                            <span className='text-gray-textlight'>Sunset</span>
                            <span>{sunsetLabel(day.sunset)}</span>
                          </li>
                        </ul>
                      </div>
                    )
                  })
                : daysUntilWindow !== null
                  ? tripDayDates().map((date) => (
                      <div
                        key={date}
                        className='rounded-lg border border-dashed border-background-dm p-4 flex flex-col items-center justify-center text-center min-h-40'
                      >
                        <p className='font-mono text-xs font-bold text-gray-textlight uppercase'>
                          {dayLabel(date)}
                        </p>
                        <p className='text-4xl my-2 opacity-40'>🔮</p>
                        <p className='font-mono text-sm font-bold text-gray-textlight'>
                          too far out
                        </p>
                      </div>
                    ))
                  : null}
            </div>

            {forecast && (
              <p className='font-mono text-xs text-gray-textlight mt-3'>
                Cloud cover is the stargazing number — under ~30% and Merritt
                delivers. UV is the float number — bring the good sunscreen.
              </p>
            )}

            {daysUntilWindow !== null && (
              <p className='font-mono text-xs text-gray-textlight mt-3 max-w-xl'>
                Real forecasts only reach about {FORECAST_HORIZON_DAYS} days
                out.
              </p>
            )}

            {!forecast && daysUntilWindow === null && (
              <p className='font-mono text-sm text-gray-textlight'>
                Loading forecast...
              </p>
            )}
          </>
        )}

        {/* Late-August climate averages - the baseline until a real forecast lands */}
        <div className='mt-8 pt-5 border-t border-background-dm'>
          <h3 className='mb-1 text-gray-textdark'>
            Typical Late-August Weather
          </h3>
          <p className='font-mono text-xs text-gray-textlight mb-3'>
            Historical averages for Valentine, NE
          </p>
          <ul className='font-mono text-sm space-y-1'>
            <li>
              <span className='font-bold'>— Daytime highs:</span> Avg 84-86°F
            </li>
            <li>
              <span className='font-bold'>— Nighttime lows:</span> Avg 56-58°F
            </li>
            <li>
              <span className='font-bold'>— Clear skies:</span> ~76% chance
            </li>
            <li>
              <span className='font-bold'>— Rain:</span> ~24% chance
            </li>
            <li>
              <span className='font-bold'>— Wind:</span> Avg 5-10 mph
            </li>
            <li>
              <span className='font-bold'>— Humidity:</span> Low chance of muggy
            </li>
          </ul>
        </div>

        {/* What past trips actually felt like, from the historical archive */}
        {pastYears.length > 0 && (
          <div className='mt-8 pt-5 border-t border-background-dm'>
            <h3 className='mb-3 text-gray-textdark'>
              For Perspective: Past Trips
            </h3>
            <div className='space-y-2'>
              {pastYears.map((year) => (
                <div
                  key={year.year}
                  className='flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-sm'
                >
                  <span className='font-bold text-pink-dark'>{year.year}</span>
                  <span className='text-gray-textlight text-xs'>
                    {year.title}
                  </span>
                  <span>☀️ {year.daytimeTemps}</span>
                  <span>🌙 {year.eveningTemps}</span>
                  {year.rain && <span>💧 {year.rain}</span>}
                  {year.humidity && <span>💦 {year.humidity}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default WeatherForecast
