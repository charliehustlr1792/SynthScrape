import React from 'react'
import Logo from '@/components/Logo'
import Link from 'next/link'

const Footer = () => {
    return (
        <div className='min-w-full bg-black border-t border-gray-800'>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-8 sm:py-10 flex flex-col items-start gap-6 border-b border-gray-800">
                        <Logo />
                    <p className='text-left text-sm text-gray-500 font-light max-w-md'>
                        Automate your web scraping with drag and drop workflows
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-12 md:gap-24 w-full mt-4">
                        <div className='flex flex-col space-y-3'>
                            <h1 className='text-white text-left text-lg font-bold mb-2'>Product</h1>
                            <Link href="/" className='text-gray-400 hover:text-white text-left text-sm font-normal transition-colors'>Pricing</Link>
                            <Link href="/" className='text-gray-400 hover:text-white text-left text-sm font-normal transition-colors'>Use Case</Link>
                            <Link href="/" className='text-gray-400 hover:text-white text-left text-sm font-normal transition-colors'>Community</Link>
                            <Link href="/" className='text-gray-400 hover:text-white text-left text-sm font-normal transition-colors'>Features</Link>
                        </div>
                        
                        <div className='flex flex-col space-y-3'>
                            <h1 className='text-white text-left text-lg font-bold mb-2'>Contact</h1>
                            <Link className="text-gray-400 hover:text-white text-sm font-normal transition-colors" href="/">Twitter</Link>
                            <Link className="text-gray-400 hover:text-white text-sm font-normal transition-colors" href="/">Email</Link>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-6">
                    <p className='text-gray-500 text-sm font-light whitespace-nowrap'>
                        © 2025 SynthScrape. All rights reserved.
                    </p>
                    <p className="text-gray-500 text-sm font-light whitespace-nowrap">
                        Made with 💙 by charliehustler
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Footer