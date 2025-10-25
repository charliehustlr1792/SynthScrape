import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const content = [
  {
    question: "What’s the buzz about SynthScrape?",
    answer: "SynthScrape is an AI-powered visual web scraping platform that lets you extract data from any website — no code, no chaos! With built-in scheduling, credential management, and automation, it’s your all-in-one data collection sidekick."
  },
  {
    question: "Do I need to know how to code to use it?",
    answer: "Not at all! SynthScrape was built for everyone — whether you're a developer, a researcher, or just someone who loves clean data. Just point, click, and let AI handle the heavy lifting!"
  },
  {
    question: "How does SynthScrape work?",
    answer: "You simply open the visual interface, select what data you want, and watch SynthScrape do the magic. It learns from your selections, scrapes intelligently, and organizes everything neatly for you. No messy scripts or setup required!"
  },
  {
    question: "Is it free to use?",
    answer: "You’ll get free credits when you sign up to test the waters — but after that, you’ll need to purchase credits to keep scraping. Pay only for what you use. Simple, transparent, and totally worth it!"
  },
  {
    question: "Can I automate my scrapes?",
    answer: "Absolutely! Schedule your scrapes to run automatically at any time you choose. SynthScrape can even handle credentials and sessions for you, so you don’t have to babysit your tasks."
  },
  {
    question: "What if a website changes or blocks my scraper?",
    answer: "No worries — websites evolve, and so does SynthScrape. Our AI automatically adapts to layout changes and can re-learn your target data structure in seconds. Plus, you can tweak anything visually!"
  },
  {
    question: "Is it only for individuals or can teams use it too?",
    answer: "Right now, SynthScrape is single-user focused — perfect for individuals and freelancers. But we’re working on collaborative features for teams soon. Stay tuned!"
  },
  {
    question: "What makes SynthScrape different from other scraping tools?",
    answer: "Most scrapers make you code or configure endless selectors. SynthScrape skips all that. With a no-code visual UI and AI that understands what you want, it’s scraping made smart, simple, and powerful."
  }
]


export function FAQSection() {
  return (
    <section id="faq" className="w-full font-Poppins py-20 md:py-28">
      <div className="container mx-auto px-6 md:px-8 lg:px-10">
        <div className="text-center mb-12 md:mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {content.map(({ question, answer }, ind) =>
              <AccordionItem value={`item-${ind + 5}`} key={ind} className="border-blue-800/30 rounded-lg overflow-hidden">
                <AccordionTrigger className="text-base sm:text-lg text-white hover:text-blue-400 p-4 bg-blue-600/25 hover:bg-blue-900/15 transition-all duration-300 text-center">
                  {question}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base text-gray-300 p-4 bg-blue-900/5">
                  {answer}
                </AccordionContent>
              </AccordionItem>)}
          </Accordion>
        </div>
      </div>
    </section>
  )
}