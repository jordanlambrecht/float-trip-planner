// app/layout.tsx

import "./globals.css"
import { IBM_Plex_Mono, Kumbh_Sans } from "next/font/google"
import { Footer, BackToTop } from "@components"
import type { ReactNode } from "react"
// import ThemeToggleWrapper from "./components/ThemeToggleWrapper"
import PlausibleProvider from "next-plausible"
import type { Metadata } from "next"

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

export const metadata: Metadata = {
  metadataBase: new URL("https://niobrara.jordanlambrecht.com"),
  title: {
    template: "%s | 2025 Niobrara Float Trip",
    default: "2025 Niobrara Float Trip",
  },
  description: "",
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <PlausibleProvider
      domain='niobrara.jordanlambrecht.com'
      trackOutboundLinks
      trackLocalhost={process.env.NODE_ENV !== "production"}
      selfHosted
      hash
      taggedEvents
      customDomain='https://analytics.jordy.world'
      enabled
    >
      <html
        lang='en'
        className={`${kumbhSans.variable} ${ibmPlexMono.variable} antialiased`}
      >
        <head>
          {/* <title>2025 Niobrara Float Trip</title> */}
          <meta
            name='viewport'
            content='width=device-width, initial-scale=1.0, viewport-fit=cover'
          />
          <link rel='icon' href='/favicon.png' sizes='any' />
        </head>
        <body className='transition-all duration-300 ease-in bg-background text-text overflow-x-hidden selection:bg-pink-dark selection:text-white min-h-screen'>
          {/* <ThemeToggleWrapper /> */}
          <main className='flex flex-col justify-start items-center w-full min-h-screen'>
            {children}
          </main>
          <Footer />
          <BackToTop />
        </body>
      </html>
    </PlausibleProvider>
  )
}

export default Layout
