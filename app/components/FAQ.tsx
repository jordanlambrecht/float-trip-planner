// app/components/FAQ.tsx
"use client"

import { useState } from "react"

interface FAQItem {
  question: string
  answer: string | React.ReactNode
}

const faqData: FAQItem[] = [
  {
    question: "Do I really need river shoes?",
    answer: "Yes. It will hurt.",
  },
  {
    question: "What if the weather is bad?",
    answer: "Idk stop being such a sissy.",
  },
  {
    question: "How deep is it?",
    answer: "Not very.",
  },
  {
    question: "Can I bring a buddy?",
    answer: "Only if they're chill and/or interesting.",
  },
  {
    question: "Are there showers?",
    answer:
      "The main office at the campground has a little storefront and private showers. Check out their website.",
  },
  {
    question: "How do I get to Sharp's Campground?",
    answer:
      "Type the words 'Sharp's Campground' into your preferred navigation app.",
  },
  {
    question: "Can I arrive late or leave early?",
    answer: "I'm not your mom idc.",
  },
]

const FAQ = () => {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index)
    } else {
      newOpenItems.add(index)
    }
    setOpenItems(newOpenItems)
  }

  return (
    <section className='w-full max-w-4xl px-4 sm:px-6'>
      <div className='mb-8'>
        <h2 className='text-2xl font-bold text-gray-textdark mb-2 text-left'>
          Frequently Asked Questions
        </h2>
      </div>

      <div className='space-y-3'>
        {faqData.map((item, index) => (
          <div
            key={index}
            className='border border-secondary rounded-lg overflow-hidden'
          >
            <button
              onClick={() => toggleItem(index)}
              className='w-full px-4 py-3 text-left bg-none hover:bg-gray-100 transition-colors focus:outline-none '
            >
              <div className='flex justify-between items-center'>
                <h3 className='font-semibold text-gray-800 pr-4 font-mono text-lg'>
                  {item.question}
                </h3>
                <span
                  className={`text-pink-dark text-xl transition-transform duration-200 ${
                    openItems.has(index) ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </div>
            </button>
            {openItems.has(index) && (
              <div className='px-4 py-3 bg-none border-t border-gray-200'>
                <div className='text-gray-700 leading-relaxed font-mono'>
                  {typeof item.answer === "string" ? (
                    <p>{item.answer}</p>
                  ) : (
                    item.answer
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export default FAQ
