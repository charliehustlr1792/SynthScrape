'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

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
      <Link href="/" className="flex items-center gap-[5px]">
        <svg 
          className="w-[26px] h-[26px] flex-shrink-0" 
          width="27" 
          height="27" 
          viewBox="0 0 27 27" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M10.5215 21.542C11.3238 21.5421 11.8739 21.6939 12.3047 21.9023C12.7506 22.1182 13.1039 22.4082 13.5293 22.7627C13.9407 23.1056 14.4257 23.514 15.0605 23.8213C15.7109 24.1359 16.4872 24.332 17.498 24.332C18.4787 24.332 19.2442 24.1339 19.8936 23.8223C20.527 23.5182 21.0266 23.1153 21.4551 22.7725C21.8986 22.4177 22.2719 22.1225 22.7285 21.9033C23.0318 21.7578 23.3836 21.6424 23.8223 21.584C21.4406 24.5779 17.7694 26.5 13.6465 26.5C10.7061 26.5 7.99435 25.5229 5.81641 23.877C5.8578 23.8584 5.89996 23.8417 5.94043 23.8223C6.57362 23.5182 7.07258 23.1152 7.50098 22.7725C7.94452 22.4176 8.31779 22.1225 8.77441 21.9033C9.21501 21.6919 9.75843 21.542 10.5215 21.542ZM24.4746 13.1689C25.2773 13.169 25.8279 13.3218 26.2588 13.5303C26.3946 13.596 26.5203 13.6708 26.6436 13.75C26.6002 16.0461 25.961 18.1958 24.875 20.0527C24.7457 20.0456 24.6124 20.042 24.4746 20.042C23.4939 20.042 22.7285 20.2401 22.0791 20.5518C21.4457 20.8558 20.9461 21.2588 20.5176 21.6016C20.0744 21.9561 19.7014 22.2506 19.2451 22.4697C18.8045 22.6812 18.2611 22.832 17.498 22.832C16.6954 22.832 16.1448 22.6792 15.7139 22.4707C15.268 22.2549 14.9146 21.9648 14.4893 21.6104C14.0779 21.2675 13.5928 20.86 12.958 20.5527C12.3078 20.2381 11.5321 20.0421 10.5215 20.042C9.54062 20.042 8.77444 20.2401 8.125 20.5518C7.49173 20.8558 6.99289 21.2588 6.56445 21.6016C6.12103 21.9563 5.74746 22.2506 5.29102 22.4697C5.06107 22.5801 4.80247 22.6718 4.5 22.7363C2.51513 20.7707 1.16002 18.1707 0.765625 15.2646C0.874806 15.3284 0.98819 15.3915 1.10742 15.4492C1.75761 15.7637 2.5334 15.9599 3.54395 15.96C4.52473 15.9599 5.29103 15.7619 5.94043 15.4502C6.57361 15.1462 7.07258 14.7431 7.50098 14.4004C7.94452 14.0456 8.31779 13.7504 8.77441 13.5312C9.21503 13.3198 9.75837 13.1689 10.5215 13.1689C11.3238 13.169 11.8738 13.3218 12.3047 13.5303C12.7507 13.7461 13.1038 14.0361 13.5293 14.3906C13.9408 14.7335 14.4256 15.142 15.0605 15.4492C15.7109 15.7638 16.4872 15.96 17.498 15.96C18.4787 15.9599 19.2442 15.7618 19.8936 15.4502C20.527 15.1461 21.0266 14.7432 21.4551 14.4004C21.8986 14.0456 22.2719 13.7504 22.7285 13.5312C23.169 13.3199 23.7118 13.169 24.4746 13.1689ZM10.5215 4.79688C11.3239 4.79697 11.8738 4.94975 12.3047 5.1582C12.7507 5.37409 13.1038 5.66396 13.5293 6.01855C13.9408 6.36146 14.4256 6.76989 15.0605 7.07715C15.7109 7.39174 16.4872 7.58789 17.498 7.58789C18.4786 7.58784 19.2442 7.38972 19.8936 7.07812C20.5269 6.7741 21.0266 6.37109 21.4551 6.02832C21.8986 5.67349 22.2719 5.37836 22.7285 5.15918C22.9294 5.06276 23.1517 4.97964 23.4062 4.91699C25.117 6.86083 26.2572 9.31788 26.5625 12.0293C25.9858 11.8048 25.3109 11.669 24.4746 11.6689C23.494 11.669 22.7284 11.8671 22.0791 12.1787C21.4456 12.4828 20.9461 12.8857 20.5176 13.2285C20.0742 13.5832 19.7015 13.8785 19.2451 14.0977C18.8045 14.3091 18.2611 14.4599 17.498 14.46C16.6954 14.46 16.1448 14.3071 15.7139 14.0986C15.2679 13.8828 14.9146 13.5928 14.4893 13.2383C14.0778 12.8954 13.5928 12.4869 12.958 12.1797C12.3078 11.8652 11.532 11.669 10.5215 11.6689C9.54062 11.6689 8.77444 11.867 8.125 12.1787C7.49177 12.4827 6.99287 12.8858 6.56445 13.2285C6.12099 13.5833 5.74751 13.8785 5.29102 14.0977C4.85042 14.3091 4.30703 14.4599 3.54395 14.46C2.74159 14.4599 2.19162 14.307 1.76074 14.0986C1.35423 13.9019 1.02561 13.6426 0.648438 13.3301C0.675672 11.2042 1.2126 9.20147 2.14355 7.43848C2.55711 7.53347 3.01885 7.58788 3.54395 7.58789C4.52473 7.58784 5.29103 7.38983 5.94043 7.07812C6.57359 6.77414 7.07259 6.37103 7.50098 6.02832C7.94452 5.67349 8.31779 5.37836 8.77441 5.15918C9.21505 4.9477 9.75831 4.79688 10.5215 4.79688ZM13.6465 0.5C16.9363 0.500024 19.9387 1.72436 22.2285 3.73926C22.1782 3.76143 22.1281 3.78314 22.0791 3.80664C21.4456 4.1107 20.9461 4.51362 20.5176 4.85645C20.0742 5.21114 19.7015 5.50644 19.2451 5.72559C18.8045 5.93707 18.2611 6.08784 17.498 6.08789C16.6954 6.08789 16.1448 5.93502 15.7139 5.72656C15.2679 5.51072 14.9147 5.22072 14.4893 4.86621C14.0778 4.52334 13.5929 4.1149 12.958 3.80762C12.3078 3.49307 11.532 3.29697 10.5215 3.29688C9.54062 3.29688 8.77444 3.49494 8.125 3.80664C7.49176 4.11062 6.99288 4.5137 6.56445 4.85645C6.12096 5.21124 5.74755 5.50641 5.29102 5.72559C4.85042 5.93707 4.30703 6.08784 3.54395 6.08789C3.34227 6.08788 3.15625 6.07734 2.98438 6.05957C5.33443 2.69824 9.23391 0.5 13.6465 0.5Z" fill="url(#paint0_linear)" />
          <defs>
            <linearGradient id="paint0_linear" x1="23.6432" y1="4.5" x2="4.64323" y2="22.9989" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4349F1"/>
              <stop offset="0.245" stopColor="#4349F1"/>
              <stop offset="0.49921" stopColor="#9EA1F9"/>
              <stop offset="0.76" stopColor="#4349F1"/>
              <stop offset="1" stopColor="#4349F1"/>
            </linearGradient>
          </defs>
        </svg>
        <span className="text-[#F1F3F7] text-xl sm:text-2xl font-bold leading-[21px]">
          Oasis
        </span>
      </Link>

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
