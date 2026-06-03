'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import Logo from '@/components/Logo'

const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
]

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <nav className={`fixed top-0 z-50 w-full h-16 flex items-center justify-between px-4 sm:px-8 lg:px-[71px] transition-all duration-300 ${scrolled
            ? 'backdrop-blur-md bg-[#070d0a]/85 border-b border-emerald-900/25 shadow-[0_1px_20px_rgba(0,0,0,0.4)]'
            : 'bg-transparent'
            }`}>
            <Logo />

            <div className="hidden lg:flex items-center gap-8">
                {navLinks.map((link) => (
                    <a
                        key={link.label}
                        href={link.href}
                        className="text-[#4a7060] text-sm font-medium hover:text-[#ecfdf5] transition-colors"
                    >
                        {link.label}
                    </a>
                ))}
            </div>

            <div className="flex items-center gap-3">
                <Link
                    href="/sign-in"
                    className="hidden sm:flex items-center justify-center h-9 px-5 rounded-full border border-emerald-900/50 text-[#6b9e85] hover:text-[#ecfdf5] hover:border-emerald-700 text-sm transition-all"
                >
                    Log in
                </Link>
                <Link
                    href="/sign-up"
                    className="hidden sm:flex items-center justify-center h-9 px-5 rounded-full bg-emerald-500/10 border border-emerald-600/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 text-sm font-medium transition-all"
                >
                    Sign up
                </Link>

                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger className="lg:hidden text-[#6b9e85] p-2 hover:bg-emerald-900/20 rounded-md transition-colors">
                        <Menu className="w-5 h-5" />
                    </SheetTrigger>
                    <SheetContent side="right" className="bg-[#070d0a] border-l border-emerald-900/30 w-[260px]">
                        <div className="flex flex-col items-center justify-center gap-7 mt-14">
                            {navLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="text-[#4a7060] text-base font-medium hover:text-[#ecfdf5] transition-colors"
                                >
                                    {link.label}
                                </a>
                            ))}
                            <div className="flex flex-col gap-3 w-full mt-2">
                                <Link
                                    href="/sign-in"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-center h-10 rounded-full border border-emerald-900/50 text-[#6b9e85] text-sm"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/sign-up"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-center h-10 rounded-full bg-emerald-500 text-[#070d0a] font-semibold text-sm"
                                >
                                    Sign up free
                                </Link>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
    )
}
