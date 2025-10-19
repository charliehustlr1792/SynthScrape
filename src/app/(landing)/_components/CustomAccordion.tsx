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
        <div className="group bg-gray-800 rounded-lg p-6 h-[200px] cursor-pointer flex-col transition-all duration-300 ease-in-out hover:bg-gray-700 relative overflow-hidden">
            <div className='mb-4'>
                <Icon color="blue" size={32}/>
            </div>
            <h1 className='text-white text-xl mb-2 text-left'>
                {title}
            </h1>
            <p className="text-gray-400 mb-2 text-sm text-left font-medium">
                {subheading}
            </p>
            <p className='text-gray-300 text-sm text-left opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-in-out max-h-40 leading-relaxed'>
                {description}
            </p>
            <div className='absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce group-hover:hidden'>
                <svg xmlns="http://www.w3.org/2000/svg" height="18" width="12.25" viewBox="0 0 448 512"><path fill="#1d24e7" d="M201.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 338.7 54.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg>
            </div>
        </div>
    )
}

export default CustomAccordion