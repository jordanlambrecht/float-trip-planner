'use client'

import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import {
  VENMO_USERNAME,
  VENMO_DISPLAY_NAME,
  VENMO_PROFILE_URL,
} from '@tripConfig'

// Compact horizontal Venmo strip: avatar + handle, pay button, small QR.
const VenmoCard = () => {
  return (
    <div className='w-full max-w-xl mx-auto rounded-xl shadow bg-blue-text text-white'>
      <div className='flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-5 py-4'>
        {/* Identity */}
        <div className='flex items-center gap-3 min-w-0'>
          <img
            src='/venmo-avatar.jpg'
            alt={`${VENMO_DISPLAY_NAME} on Venmo`}
            className='w-10 h-10 shrink-0 rounded-full border border-white object-cover'
          />
          <div className='min-w-0'>
            <p className='font-bold leading-tight'>{VENMO_DISPLAY_NAME}</p>
            <p className='font-mono text-xs text-white/80 truncate'>
              @{VENMO_USERNAME}
            </p>
          </div>
        </div>

        {/* Pay button */}
        <Link
          href={VENMO_PROFILE_URL}
          target='_blank'
          rel='noopener noreferrer'
          className='px-4 py-2 bg-white text-blue-text font-bold rounded-full hover:bg-white/90 transition-colors font-mono text-xs whitespace-nowrap'
        >
          Pay on Venmo
        </Link>

        {/* QR */}
        <div
          className='bg-white rounded-md p-1.5 shrink-0'
          title='Scan with your camera or the Venmo app'
        >
          <QRCodeSVG
            value={VENMO_PROFILE_URL}
            size={56}
            bgColor='#ffffff'
            fgColor='#1e40af'
            level='M'
          />
        </div>
      </div>
    </div>
  )
}

export default VenmoCard
