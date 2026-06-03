"use client"

import { motion } from "motion/react"
import Link from 'next/link'
import React from 'react'

const workflowNodes = ["Visit URL", "Click element", "Extract data", "Export"]

export default function HeroSection() {
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-16">
            {/* Ambient glow blobs */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[900px] h-[400px] rounded-full bg-emerald-600/5 blur-[130px]" />
            </div>
            <div className="absolute top-1/3 left-[10%] w-[280px] h-[280px] rounded-full bg-emerald-500/6 blur-[90px] pointer-events-none" />
            <div className="absolute top-1/2 right-[10%] w-[200px] h-[200px] rounded-full bg-teal-500/5 blur-[70px] pointer-events-none" />

            <motion.h1
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, ease: "easeOut" }}
                className="relative z-10 max-w-[820px] text-[#ecfdf5] text-5xl sm:text-6xl lg:text-[72px] font-black leading-[1.05] mb-5 tracking-tight"
            >
                Scrape any website{' '}
                <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent animate-shimmer [background-size:200%_auto]">
                    No code required
                </span>
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.18, ease: "easeOut" }}
                className="relative z-10 max-w-[440px] text-[#6b9e85] text-base sm:text-lg leading-relaxed mb-10"
            >
                Build visual workflows to extract data from any site
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.32, ease: "easeOut" }}
                className="relative z-10 flex flex-col sm:flex-row items-center gap-4 mb-16"
            >
                <Link
                    href="/sign-up"
                    className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#070d0a] font-bold text-base transition-all shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:shadow-[0_0_44px_rgba(16,185,129,0.45)]"
                >
                    Get started free
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </Link>
                <a
                    href="#features"
                    className="inline-flex items-center justify-center h-12 px-8 rounded-full border border-emerald-800/50 text-[#6b9e85] hover:text-[#ecfdf5] hover:border-emerald-700 text-base transition-all"
                >
                    See how it works
                </a>
            </motion.div>

            {/* Workflow hint */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="relative z-10 flex items-center justify-center"
            >
                {workflowNodes.map((label, i, arr) => (
                    <React.Fragment key={i}>
                        <div className="px-3 py-2 rounded-lg border border-emerald-800/40 bg-emerald-950/30 text-emerald-600/70 text-xs font-mono whitespace-nowrap">
                            {label}
                        </div>
                        {i < arr.length - 1 && (
                            <div className="flex items-center">
                                <div className="w-5 h-px bg-emerald-800/40" />
                                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-emerald-800/50">
                                    <path d="M1 4h6M4 1l3 3-3 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </motion.div>

            {/* Scroll cue */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-[#2d5040]">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </section>
    )
}
