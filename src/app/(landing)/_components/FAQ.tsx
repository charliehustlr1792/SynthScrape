import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const content = [
  {
    question: "What is SynthScrape?",
    answer: "SynthScrape is a no-code visual web scraping platform. You build scraping workflows with a drag-and-drop editor - no scripts, no selectors, no code."
  },
  {
    question: "Do I need to know how to code?",
    answer: "No. SynthScrape is built for non-technical users. Point, click, and configure your workflow visually. The AI handles the rest."
  },
  {
    question: "How does a workflow work?",
    answer: "You open the visual editor, add nodes for navigation, data extraction, and transformations, then run the workflow. Results are stored and available to export anytime."
  },
  {
    question: "Is it free to use?",
    answer: "You get 1,000 free credits when you sign up - no credit card required. After that, you purchase credits as needed. You only pay for what you run."
  },
  {
    question: "Can I schedule scraping jobs?",
    answer: "Yes. You can set any workflow to run on a schedule - hourly, daily, weekly, or with a custom cron expression."
  },
  {
    question: "What happens if a website changes its layout?",
    answer: "SynthScrape's AI adapts to layout changes automatically when possible. You can also update your workflow visually in minutes."
  },
  {
    question: "Can I export my data?",
    answer: "Yes. Scraped data can be exported directly from the dashboard, or pushed to external services via webhooks."
  },
  {
    question: "What makes SynthScrape different from other tools?",
    answer: "Most scraping tools require code or complex configuration. SynthScrape replaces all of that with a visual canvas and AI-assisted extraction - faster to build and easier to maintain."
  }
]

export function FAQSection() {
  return (
    <section id="faq" className="relative z-10 w-full bg-[#0c1a12] py-20 md:py-28 scroll-mt-16">
      <div className="px-4 sm:px-8 lg:px-[70px] max-w-6xl mx-auto">
        <div className="mb-12 md:mb-16 text-center">
          <p className="text-emerald-500/70 text-xs font-bold uppercase tracking-[0.2em] mb-3">FAQ</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#ecfdf5] tracking-tight">
            Frequently asked questions
          </h2>
        </div>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-3">
            {content.map(({ question, answer }, ind) => (
              <AccordionItem
                value={`item-${ind}`}
                key={ind}
                className="border border-emerald-900/30 rounded-xl overflow-hidden"
              >
                <AccordionTrigger className="text-base sm:text-lg text-[#d4ede0] hover:text-emerald-400 px-5 py-4 bg-[#070d0a] hover:bg-[#0a120d] transition-all duration-200 text-left [&>svg]:text-emerald-600">
                  {question}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base text-[#4a7060] px-5 py-4 bg-[#070d0a]/60 leading-relaxed">
                  {answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
