import React from 'react'
import type { LucideIcon } from 'lucide-react';

interface CustomAccordionProps {
    icon: LucideIcon
    title: String;
    subheading: String;
    description: String;
}

const CustomAccordion = ({ icon, title, subheading, description }: CustomAccordionProps) => {
    const Icon = icon;
    return (
        <div className="group bg-[#111a16] rounded-lg p-6 h-[200px] cursor-pointer flex-col transition-all duration-300 ease-in-out hover:bg-[#162520] relative overflow-hidden border border-emerald-900/30 hover:border-emerald-700/50">
            <div className="mb-4">
                <Icon color="#10b981" size={28} />
            </div>
            <h3 className="text-[#ecfdf5] text-lg font-semibold mb-1 text-left">
                {title}
            </h3>
            <p className="text-[#7aad95] mb-2 text-sm text-left">
                {subheading}
            </p>
            <p className="text-[#a7c4b5] text-sm text-left opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-in-out max-h-40 leading-relaxed">
                {description}
            </p>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce group-hover:hidden">
                <svg xmlns="http://www.w3.org/2000/svg" height="16" width="11" viewBox="0 0 448 512">
                    <path fill="#10b981" d="M201.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 338.7 54.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
                </svg>
            </div>
        </div>
    )
}

export default CustomAccordion
