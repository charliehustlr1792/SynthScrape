import React from 'react'
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SquareDashedMousePointer } from 'lucide-react';

const Logo = ({ fontSize = "text-2xl", iconSize = 20 }: {
    fontSize?: string;
    iconSize?: number;
}) => {
    return (
        <Link href="/" className={cn("text-2xl font-extrabold flex items-center gap-2", fontSize)}>
            <div className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 p-2">
                <SquareDashedMousePointer size={iconSize} className='stroke-white' />
            </div>
            <div>
                <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">Synth</span>
                <span className='text-slate-700 dark:text-slate-400'>Scrape</span>
            </div>
        </Link>
    )
}

export default Logo