"use client"

import CountUp from 'react-countup'

const stats = [
    { end: 50, suffix: "+", label: "Workflow node types" },
    { end: 1000, suffix: "", label: "Free credits on signup" },
    { end: 0, suffix: "", prefix: "", label: "Lines of code needed", display: "Zero" },
]

export default function StatsBar() {
    return (
        <div className="relative z-10 mx-4 sm:mx-8 lg:mx-[70px] mb-20">
            <div className="grid grid-cols-3 divide-x divide-emerald-900/30 border border-emerald-900/30 rounded-2xl bg-[#0d1612]/60 backdrop-blur-sm overflow-hidden">
                {stats.map(({ end, suffix, prefix, label, display }, i) => (
                    <div key={i} className="flex flex-col items-center py-7 px-4">
                        <p className="text-3xl sm:text-4xl font-black text-emerald-400 tabular-nums leading-none mb-1">
                            {display ? (
                                <span>{display}</span>
                            ) : (
                                <CountUp
                                    end={end}
                                    suffix={suffix}
                                    prefix={prefix}
                                    enableScrollSpy
                                    scrollSpyOnce
                                    duration={2}
                                />
                            )}
                        </p>
                        <p className="text-[#3a5a48] text-xs sm:text-sm text-center">{label}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
