// app/layout.tsx

import "./globals.css"
import { IBM_Plex_Mono, Kumbh_Sans } from "next/font/google"
import { Footer } from "@components"
import type { ReactNode } from "react"
// import ThemeToggleWrapper from "./components/ThemeToggleWrapper"
import PlausibleProvider from "next-plausible"

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
  weight: ["400", "500", "600", "700", "800"],
})

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <PlausibleProvider
      domain='niobrara.jordanlambrecht.com'
      trackOutboundLinks
      trackLocalhost={process.env.NODE_ENV !== "production"}
      selfHosted
      taggedEvents
      customDomain='https://analytics.jordy.world'
      enabled
      hash
    >
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
          {/* Add script to prevent flash of wrong theme */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
              (function() {
                const theme = localStorage.getItem('theme') ||
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                if (theme === 'dark') document.documentElement.classList.add('dark');
              })();
            `,
            }}
          />
        </head>
        <body className='transition-all duration-300 ease-in bg-background text-text   max-w-vw selection:bg-pink-dark selection:text-white'>
          {/* <ThemeToggleWrapper /> */}
          <main className='flex flex-col justify-start items-center'>
            {children}
          </main>
          <Footer />
        </body>
      </html>
    </PlausibleProvider>
  )
}

export default Layout
