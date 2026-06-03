import React from 'react'
import Logo from '@/components/Logo'
import Link from 'next/link'

const Footer = () => {
    return (
        <div className="min-w-full bg-[#040a07] border-t border-emerald-900/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-10 flex flex-col items-start gap-6 border-b border-emerald-900/20">
                    <Logo />
                    <p className="text-left text-sm text-[#4a7060] font-light max-w-md">
                        Automate web scraping with drag-and-drop workflows. No code required.
                    </p>
                    <div className="grid grid-cols-2 gap-12 md:gap-24 w-full mt-2">
                        <div className="flex flex-col space-y-3">
                            <p className="text-[#ecfdf5] text-sm font-semibold mb-1">Product</p>
                            <a href="#features" className="text-[#4a7060] hover:text-[#7aad95] text-sm transition-colors">Features</a>
                            <a href="#pricing" className="text-[#4a7060] hover:text-[#7aad95] text-sm transition-colors">Pricing</a>
                            <a href="#faq" className="text-[#4a7060] hover:text-[#7aad95] text-sm transition-colors">FAQ</a>
                        </div>
                        <div className="flex flex-col space-y-3">
                            <p className="text-[#ecfdf5] text-sm font-semibold mb-1">Contact</p>
                            <Link className="text-[#4a7060] hover:text-[#7aad95] text-sm transition-colors" href="https://x.com/charliehustler9">Twitter</Link>
                            <Link className="text-[#4a7060] hover:text-[#7aad95] text-sm transition-colors" href="mailto:nilangshubhattacharyya1234@gmail.com">Email</Link>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-6">
                    <p className="text-[#4a7060] text-sm font-light">
                        © 2025 SynthScrape. All rights reserved.
                    </p>
                    <p className="text-[#4a7060] text-sm font-light">
                        Made with ♥ by charliehustler
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Footer
