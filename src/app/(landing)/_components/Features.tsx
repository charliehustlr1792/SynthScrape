import { LucideIcon } from 'lucide-react';
import React from 'react'

interface FeatureProps {
    Icon: LucideIcon
    title: string;
    description: string
}

const Features = ({ Icon, title, description }: FeatureProps) => {
    return (
        <div className="group h-auto cursor-pointer overflow-hidden bg-[#111a16] hover:bg-[#162520] border border-emerald-900/30 hover:border-emerald-700/50 rounded-lg p-6 flex flex-col transition-all duration-300 ease-in-out">
            <div className="mb-4">
                <Icon color="#10b981" size={28} />
            </div>
            <h3 className="text-[#ecfdf5] text-lg font-semibold mb-2 text-left">
                {title}
            </h3>
            <p className="text-[#7aad95] text-sm text-left leading-relaxed">
                {description}
            </p>
        </div>
    )
}

export default Features
