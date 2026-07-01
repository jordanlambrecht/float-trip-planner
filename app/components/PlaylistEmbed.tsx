'use client'

import { useEffect, useState } from 'react'
import { H2 } from './ui/Typography'
import Link from 'next/link'
import { SPOTIFY_PLAYLIST_URL } from '@tripConfig'
import { getSpotifyPlaylistAction } from '@actions'
import type { SpotifyPlaylist } from '@types'

// Custom playlist preview powered by the Spotify Web API (cover art + track
// titles/artists), with prominent follow / add-a-song actions so the playlist
// can be built as a group. Falls back to the official iframe embed if the API
// call fails (e.g. credentials missing). The client secret stays server-side.
const toEmbedUrl = (playlistUrl: string): string | null => {
  const match = playlistUrl.match(/open\.spotify\.com\/playlist\/([\w]+)/)
  return match
    ? `https://open.spotify.com/embed/playlist/${match[1]}?theme=0`
    : null
}

const PlaylistEmbed = () => {
  const [data, setData] = useState<SpotifyPlaylist | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!SPOTIFY_PLAYLIST_URL) return
    let active = true
    getSpotifyPlaylistAction()
      .then((res) => {
        if (!active) return
        if ('error' in res) setFailed(true)
        else setData(res)
      })
      .catch(() => {
        if (active) setFailed(true)
      })
    return () => {
      active = false
    }
  }, [])

  if (!SPOTIFY_PLAYLIST_URL) return null

  const embedUrl = toEmbedUrl(SPOTIFY_PLAYLIST_URL)

  return (
    <section className='w-full h-auto flex flex-col items-center justify-center p-4 sm:p-6'>
      <div className='p-6 flex-col grow w-full max-w-4xl rounded-lg shadow-2xl border border-background-dm bg-cardbg'>
        {/* Header: cover on the left; title with the subtext directly beneath
            it, and the follow / add actions pinned top-right. */}
        <div className='flex flex-col sm:flex-row sm:items-start gap-4 mb-6'>
          {data?.cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.cover}
              alt={`${data.name} cover`}
              className='w-28 h-28 rounded-lg object-cover shadow-md shrink-0'
            />
          )}
          <div className='flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3'>
            <div className='min-w-0'>
              <H2 className='mb-1'>{data?.name || 'Float Trip Soundtrack'}</H2>
              <p className='font-mono text-sm text-gray-textlight'>
                collaborative playlist of songs we may or may not float to
                depending if they&apos;re bad or not
              </p>
            </div>
            <div className='flex gap-2 shrink-0'>
              <Link
                href={SPOTIFY_PLAYLIST_URL}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center justify-center px-4 py-2.5 bg-teal-dark text-white font-mono text-sm font-bold rounded-full hover:bg-opacity-90 transition-colors whitespace-nowrap'
              >
                ♥ Follow
              </Link>
              <Link
                href={SPOTIFY_PLAYLIST_URL}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center justify-center px-4 py-2.5 border-2 border-teal-dark text-teal-text font-mono text-sm font-bold rounded-full hover:bg-teal-light transition-colors whitespace-nowrap'
              >
                ➕ Add a Song
              </Link>
            </div>
          </div>
        </div>

        {/* Body */}
        {failed ? (
          embedUrl && (
            <iframe
              src={embedUrl}
              title='Float trip Spotify playlist'
              className='w-full h-105 border-0 rounded-xl'
              allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
              loading='lazy'
            />
          )
        ) : !data ? (
          <p className='font-mono text-sm text-gray-textlight py-8 text-center'>
            Loading the playlist…
          </p>
        ) : data.tracks.length === 0 ? (
          <div className='text-center py-10 border-2 border-dashed border-gray-textlight/40 rounded-xl'>
            <p className='font-mono text-base text-gray-textdark mb-1'>
              No songs yet — be the first to add one. 🎶
            </p>
            <p className='font-mono text-sm text-gray-textlight'>
              Tap Add a Song above to start building the soundtrack.
            </p>
          </div>
        ) : (
          <>
            <ul className='flex flex-col divide-y divide-background-dm max-h-120 overflow-y-auto overflow-x-hidden'>
              {data.tracks.map((track) => (
                <li key={track.id}>
                  <Link
                    href={track.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center gap-3 py-2 px-2 rounded-md hover:bg-gray-pagebg transition-colors'
                  >
                    {track.albumImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={track.albumImage}
                        alt=''
                        className='w-10 h-10 rounded object-cover shrink-0'
                      />
                    ) : (
                      <div className='w-10 h-10 rounded bg-gray-pagebg shrink-0' />
                    )}
                    <div className='min-w-0'>
                      <p className='font-mono text-sm text-gray-textdark truncate'>
                        {track.name}
                      </p>
                      <p className='font-mono text-xs text-gray-textlight truncate'>
                        {track.artists}
                      </p>
                      {track.addedBy && (
                        <p className='font-mono text-xs text-gray-textlight/70 truncate'>
                          added by {track.addedBy}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            {data.total > data.tracks.length && (
              <Link
                href={SPOTIFY_PLAYLIST_URL}
                target='_blank'
                rel='noopener noreferrer'
                className='block text-center mt-4 font-mono text-sm text-teal-text hover:underline'
              >
                + {data.total - data.tracks.length} more on Spotify
              </Link>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default PlaylistEmbed
