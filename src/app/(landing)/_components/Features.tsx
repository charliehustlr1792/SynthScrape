import { LucideIcon } from 'lucide-react';
import React from 'react'

interface FeatureProps{
    Icon:LucideIcon
    title:string;
    description:string
}

const Features = ({Icon,title,description}:FeatureProps) => {
  return (
    <div className='group h-auto min-w-[350px] curosr-pointer overflow-hidden bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-blue-500 rounded-lg p-6 flex flex-col transition-all duration-300 ease-in-out'>
        <div className='mb-4'>
            <Icon color="blue" size={32}/>
        </div>
        <h1 className='text-white text-xl mb-2 text-left'>
            {title}
        </h1>
        <p className='text-gray-300 text-sm text-left leading-tight'>
            {description}
        </p>
    </div>
  )
}

export default Features