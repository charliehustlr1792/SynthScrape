import React from 'react'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Layers, SlidersHorizontal, Zap } from 'lucide-react'

import Navbar from './_components/Navbar'
import HeroSection from './_components/HeroSection'
import { FAQSection } from './_components/FAQ'
import Footer from './_components/Footer'

const steps = [
    {
        number: "01",
        Icon: Layers,
        title: "Build",
        description: "Open the visual editor and drag workflow nodes onto the canvas. No code, no terminal.",
    },
    {
        number: "02",
        Icon: SlidersHorizontal,
        title: "Configure",
        description: "Point and click to select what you want. Set schedules, outputs, and automation logic visually.",
    },
    {
        number: "03",
        Icon: Zap,
        title: "Run",
        description: "Execute your workflow and collect clean, structured data. Monitor runs from a live dashboard.",
    },
]

export default async function LandingPage() {
    const { userId } = await auth()
    if (userId) {
        redirect('/dashboard')
    }

    return (
        <div className="relative bg-[#070d0a] overflow-x-hidden">
            {/* Dot grid */}
            <div
                className="fixed inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(16,185,129,0.065) 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                }}
            />

            <Navbar />
            <HeroSection />

            {/* Section separator */}
            <div className="relative z-10 h-px mx-4 sm:mx-8 lg:mx-[70px] bg-gradient-to-r from-transparent via-emerald-900/50 to-transparent" />

            {/* How it works — tinted background for contrast */}
            <section id="features" className="relative z-10 bg-[#0c1a12] py-24 scroll-mt-16">
                {/* Ambient glow for this section */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full bg-emerald-800/10 blur-[80px]" />
                </div>

                <div className="relative px-4 sm:px-8 lg:px-[70px] max-w-6xl mx-auto">
                    <div className="mb-16 text-center">
                        <p className="text-emerald-500/70 text-xs font-bold uppercase tracking-[0.2em] mb-3">How it works</p>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#ecfdf5] tracking-tight">
                            From zero to running scraper in minutes
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {steps.map(({ number, Icon, title, description }) => (
                            <div
                                key={number}
                                className="relative bg-[#070d0a] border border-emerald-900/20 rounded-xl p-6 overflow-hidden group hover:border-emerald-800/40 transition-colors"
                            >
                                {/* Left accent bar */}
                                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-emerald-500/70 via-emerald-500/20 to-transparent" />
                                <div className="flex items-center gap-2 mb-5">
                                    <span className="text-emerald-900/80 group-hover:text-emerald-800 text-xs font-black font-mono transition-colors">{number}</span>
                                    <Icon className="text-emerald-500" size={18} />
                                </div>
                                <h3 className="text-[#ecfdf5] text-xl font-bold mb-2">{title}</h3>
                                <p className="text-[#3a5a48] text-sm leading-relaxed">{description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section separator */}
            <div className="relative z-10 h-px mx-4 sm:mx-8 lg:mx-[70px] bg-gradient-to-r from-transparent via-emerald-900/40 to-transparent" />

            {/* Pricing — back to base dark, card stands out via contrast */}
            <section id="pricing" className="relative z-10 py-24 scroll-mt-16">
                <div className="relative px-4 sm:px-8 lg:px-[70px] max-w-6xl mx-auto">
                    <div className="mb-16 text-center">
                        <p className="text-emerald-500/70 text-xs font-bold uppercase tracking-[0.2em] mb-3">Pricing</p>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#ecfdf5] tracking-tight">
                            Pay for what you use, Nothing more.
                        </h2>
                    </div>

                    <div className="max-w-md mx-auto">
                        {/* Pricing card — emerald top stripe for visual anchor */}
                        <div className="relative bg-[#0c1a12] border border-emerald-900/40 rounded-2xl overflow-hidden">
                            {/* Top stripe */}
                            <div className="h-1 bg-gradient-to-r from-emerald-600 via-teal-400 to-emerald-600" />

                            <div className="p-8 sm:p-10">
                                {/* Ambient glow inside card */}
                                <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-emerald-500/5 blur-[50px] pointer-events-none" />

                                <div className="relative flex items-start justify-between gap-4 mb-8">
                                    <div>
                                        <p className="text-emerald-500 text-xs font-bold uppercase tracking-[0.15em] mb-2">Credit-based</p>
                                        <h3 className="text-[#ecfdf5] text-4xl font-black">Pay as you go</h3>
                                    </div>
                                    <span className="flex-shrink-0 mt-1 px-3 py-1 rounded-full bg-emerald-500/8 border border-emerald-600/25 text-emerald-400 text-xs font-medium">
                                        No subscription
                                    </span>
                                </div>

                                <ul className="relative space-y-3 mb-8">
                                    {[
                                        "1,000 free credits on signup",
                                        "Credits never expire",
                                        "Pay only for what you run",
                                        "Full access to all features from day one",
                                    ].map((item) => (
                                        <li key={item} className="flex items-center gap-3 text-[#6b9e85] text-sm">
                                            <span className="w-4 h-4 rounded-full border border-emerald-700/50 bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                                                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                                    <path d="M1.5 4l2 2 3-3" stroke="#10b981" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href="/sign-up"
                                    className="relative inline-flex items-center justify-center w-full h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#070d0a] font-bold text-base transition-all shadow-[0_0_24px_rgba(16,185,129,0.2)] hover:shadow-[0_0_36px_rgba(16,185,129,0.35)]"
                                >
                                    Start with free credits
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section separator */}
            <div className="relative z-10 h-px mx-4 sm:mx-8 lg:mx-[70px] bg-gradient-to-r from-transparent via-emerald-900/40 to-transparent" />

            <FAQSection />
            <Footer />
        </div>
    )
}
