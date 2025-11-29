"use client"
import React, { useEffect } from 'react'
import Navbar from './_components/Navbar'
import Link from 'next/link'
import Image from 'next/image'
import CustomAccordion from './_components/CustomAccordion'
import { Activity } from 'lucide-react'
import Footer from './_components/Footer'
import Features from './_components/Features'
import { FAQSection } from './_components/FAQ'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/router'


const content = [
    {
        icon: Activity,
        title: "Increased Productivity",
        subheading: "Automate complex web scraping tasks and save valuable time.",
        description: "Boost your workflow efficiency by automating repetitive data collection. Free your team to focus on insights and decision-making instead of manual scraping."
    }, {
        icon: Activity,
        title: "AI Powered Workflows",
        subheading: "Leverage AI to manage and manipulate your data during the scraping process.",
        description: "Our intelligent algorithms analyze or modify your scraped data, providing predictive insights you can act on."
    }, {
        icon: Activity,
        title: "Automated Workflows",
        subheading: "Build automated workflows that run on your schedule.",
        description: "Easily chain together scraping steps and automate end-to-end data collection. Set schedules or triggers and let Scrapeflow handle the rest automatically."
    }, {
        icon: Activity,
        title: "Cost Transparency",
        subheading: "Transparent pricing with clear usage breakdowns.",
        description: "Know exactly what you’re paying for with detailed cost reports. Optimize your budget and only pay for the data you actually collect."
    }
]

const CardContent = [
    {
        Icon: Activity,
        title: "Visual Workflow Editor",
        description: "Create and edit scraping workflows with our intuitive drag-and-drop interface."
    },
    {
        Icon: Activity,
        title: "Data Storage",
        description: "Store and manage your scraped data with automatic organization and filtering."
    },
    {
        Icon: Activity,
        title: "AI Powered Extraction",
        description: "Leverage machine learning to extract and transform data from complex websites automatically."
    },
    {
        Icon: Activity,
        title: "Advanced Selectors",
        description: "Target specific elements with precision using our advanced selection tools."
    }, {
        Icon: Activity,
        title: "Scheduling and Monitoring",
        description: "Schedule scraping jobs and monitor their performance in real-time."
    }, {
        Icon: Activity,
        title: "WebHooks",
        description: "Connect your workflows to other services with our Webhook."
    }
]


const LandingPage = () => {
    const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn, isLoaded, router]);

  if (!isLoaded) return <div>Loading...</div>;
    return (
        <>
            <div className="w-full min-h-screen bg-[#030013] relative overflow-hidden">
                <div className="absolute left-1/2 -translate-x-1/2 top-[-91px] w-full max-w-[1200px] h-[1273px] pointer-events-none hidden sm:block">
                    <Image
                        src="/background.png"
                        alt="background gradient"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-[150px] w-full max-w-[600px] h-[600px] pointer-events-none sm:hidden opacity-60">
                    <Image
                        src="/background.png"
                        alt="background gradient"
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


                <div className="mx-auto text-center px-[70px] min-h-screen flex flex-col">
                    <h1 className="text-[#F2F4FF] text-4xl font-bold leading-tight sm:leading-tight md:leading-tight lg:leading-[72px] mb-4 sm:mb-6">
                        Built for REAL WORLD web scraping needs
                    </h1>

                    <p className="max-w-[625px] mx-auto text-[#ECEDFF] text-base sm:text-lg font-normal leading-relaxed sm:leading-[27px] mb-8 sm:mb-10">
                        Scrapeflow empowers you to automate web data extraction with no coding required. Create custom scraping workflows, monitor web pages, and transform raw data into actionable and easier than ever.
                    </p>

                    <div className='grid grid-cols-2 gap-6 flex-col p-4 '>
                        {content.map((item, index) => (
                            <CustomAccordion key={index} title={item.title} subheading={item.subheading} description={item.description} icon={item.icon} />
                        ))}
                    </div>
                </div>

                <div className="w-full flex justify-center mt-12 mb-6">
                    <button className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6  text-white inline-block">
                        <span className="absolute inset-0 overflow-hidden rounded-full">
                            <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        </span>
                        <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10 ">
                            <span>
                                Features
                            </span>
                        </div>
                        <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
                    </button>
                </div>
                <div className='flex flex-col items-center justify-center mx-auto text-center'>
                    <h1 className='text-white text-4xl font-cold leading-tight sm:leading-tight md:leading-tight lg:leading-[72px] mb:4 sm-mb-6'>Best in-class Features for Web Scraping</h1>
                    <p className='max-w-[635px] mx-auto text-white text-base sm:text-lg font-normal leading-relaxed sm:leading-[27px] mb-8 sm:mb-10'>Use visual Workflow Nodes to automate navigation, clicks, data extraction, and decision logic
                        — all from a drag-and-drop editor in your browser.</p>
                    <div className='grid grid-cols-3 gap-4 p-4 min-h-96 mb-24 mr-24 ml-24'>
                        {CardContent.map((item, index) => (
                            <Features key={index} Icon={item.Icon} title={item.title} description={item.description} />
                        ))}
                    </div>
                </div>
            </div>
            
            <FAQSection/>
            <Footer />
        </>
    )
}

export default LandingPage
