'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import Logo from '@/components/Logo'
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { label: 'Products', href: '#products' },
    { label: 'Solutions', href: '#solutions' },
    { label: 'Company', href: '#company' },
    { label: 'Resources', href: '#resources' },
    { label: 'Pricing', href: '#pricing' },
  ]

  return (
    <nav className="relative z-50 w-full h-[85px] flex items-center justify-between px-4 sm:px-8 lg:px-[71px]">
      <Logo/>

      <div className="hidden lg:flex items-center gap-[30px]">
        {navLinks.map((link) => (
          <a 
            key={link.label}
            href={link.href}
            className="text-[#D6D7E0] text-sm font-normal leading-[17px] hover:text-white transition-colors cursor-pointer"
          >
            {link.label}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Link 
          href="/sign-in"
          className="hidden sm:flex items-center justify-center h-[40px] px-5 py-[11px] rounded-[99px] border border-white/20 shadow-[0_0_0_1px_rgba(255,255,255,0.9)] whitespace-nowrap hover:bg-white/5 transition-colors"
        >
          <span className="text-[#EDEEF3] text-sm font-normal leading-[18px]">Log in</span>
        </Link>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger className="lg:hidden text-white p-2 hover:bg-white/10 rounded-md transition-colors">
            <Menu className="w-6 h-6" />
          </SheetTrigger>
          <SheetContent side="right" className="bg-gradient-to-br from-[#030013] via-[#0a0525] to-[#030013] border-l border-white/10 w-[300px] sm:w-[400px]">
            <div className="flex flex-col items-center justify-center gap-8 mt-12">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-[#D6D7E0] text-lg font-normal hover:text-white hover:scale-105 transition-all duration-200 cursor-pointer text-center px-6 py-2 rounded-lg hover:bg-white/5"
                >
                  {link.label}
                </a>
              ))}
              <Link
                href="/sign-in"
                onClick={() => setIsOpen(false)}
                className="sm:hidden flex items-center justify-center h-[40px] px-5 py-[11px] rounded-[99px] border border-white/20 shadow-[0_0_0_1px_rgba(255,255,255,0.9)] whitespace-nowrap hover:bg-white/10 hover:scale-105 transition-all duration-200 mt-6"
              >
                <span className="text-[#EDEEF3] text-sm font-normal leading-[18px]">Log in</span>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}

export default Navbar
