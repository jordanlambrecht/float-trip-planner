// app/layout.tsx

import "./globals.css"
import { IBM_Plex_Mono, Kumbh_Sans } from "next/font/google"
import { Footer } from "@components"
import type { ReactNode } from "react"

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
})
const kumbhSans = Kumbh_Sans({
  subsets: ["latin"],
  variable: "--font-kumbh-sans",
  display: "swap",
  weight: "700",
})

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <html
      lang='en'
      className={`${kumbhSans.variable} ${ibmPlexMono.variable} antialiased`}
    >
      <head>
        <title>Niobrara Float Trip Poll</title>
        <meta
          name='description'
          content='Help us determine the best time for a Niobrara float trip!'
        />
        <link rel='icon' href='/favicon.png' sizes='any' />
      </head>
      <body className='transition-all duration-300 ease-in bg-background text-text dark:text-text-dm dark:bg-background-dm max-w-vw selection:bg-pink-dark selection:text-white'>
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}

export default Layout
