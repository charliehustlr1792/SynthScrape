import React from 'react'
import Navbar from './_components/Navbar'
import Link from 'next/link'
import Image from 'next/image'

const LandingPage = () => {
    return (
        <div className="w-full min-h-screen bg-[#030013] relative overflow-hidden">
            <div className="absolute left-1/2 -translate-x-1/2 top-[-91px] w-full max-w-[1200px] h-[1273px] pointer-events-none hidden sm:block">
                <Image
                    src="/background.png"
                    alt=""
                    fill
                    className="object-contain"
                    priority
                />
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 top-[150px] w-full max-w-[600px] h-[600px] pointer-events-none sm:hidden opacity-60">
                <Image
                    src="/background.png"
                    alt=""
                    fill
                    className="object-contain"
                    priority
                />
            </div>

            <Navbar />

            <div className="relative pt-12 sm:pt-16 lg:pt-[90px] pb-12 sm:pb-16 lg:pb-[100px]">
                <div className="max-w-[795px] mx-auto text-center px-4 sm:px-6 lg:px-4">
                    <h1 className="text-[#F2F4FF] text-3xl sm:text-4xl md:text-5xl lg:text-[66px] font-bold leading-tight sm:leading-tight md:leading-tight lg:leading-[72px] mb-4 sm:mb-6">
                        Streamline Operations with Accurate CRM
                    </h1>

                    <p className="max-w-[525px] mx-auto text-[#ECEDFF] text-base sm:text-lg font-normal leading-relaxed sm:leading-[27px] mb-8 sm:mb-10">
                        Unlock customer engagement with personalized interactions that drive loyalty, growth, and lasting success.
                    </p>

                    <Link
                        href="/sign-up"
                        className="inline-flex items-center gap-1 h-12 px-6 sm:px-8 rounded-[999px] bg-white shadow-[0_1px_2px_0_#274D93,0_0_0_1px_#345FAF,0_20px_46px_-18px_rgba(37,68,143,0.5)] hover:shadow-[0_1px_2px_0_#274D93,0_0_0_1px_#345FAF,0_24px_52px_-18px_rgba(37,68,143,0.6)] transition-shadow"
                    >
                        <span className="text-[#262629] text-base sm:text-lg font-medium leading-[31px]">Get Started</span>
                        <svg
                            className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
                            width="25"
                            height="25"
                            viewBox="0 0 25 25"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M15.5001 17.3398L20.5 12.3398L15.5 7.33984" stroke="#262629" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M4.5 12.3398H20.5" stroke="#262629" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Link>
                </div>

                <div className="relative mt-12 sm:mt-16 lg:mt-[80px] px-4 sm:px-8 lg:px-[70px]">
                    <div className="relative w-full max-w-[1300px] mx-auto">
                        <Image
                            src="/dummydashboard.png"
                            alt="Dashboard preview"
                            width={1300}
                            height={924}
                            className="w-full h-auto rounded-[10px] border border-[#21212A] shadow-lg"
                        />
                    </div>
                </div>
            </div>


            <div className="mx-auto text-center px-4 sm:px-6 lg:px-4">
                <h1 className="text-[#F2F4FF] text-4xl sm:text-2xl font-bold leading-tight sm:leading-tight md:leading-tight lg:leading-[72px] mb-4 sm:mb-6">
                    Built for REAL WORLD web scraping needs
                </h1>

                <p className="max-w-[525px] mx-auto text-[#ECEDFF] text-base sm:text-lg font-normal leading-relaxed sm:leading-[27px] mb-8 sm:mb-10">
                    Scrapeflow empowers you to automate web data extraction with no coding required. Create custom scraping workflows, monitor web pages, and transform raw data into actionable and easier than ever.
                </p>
            </div>
            
            

        </div>
    )
}

export default LandingPage
