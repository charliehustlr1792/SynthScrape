"use client"
import { TooltipContent, TooltipProvider, TooltipTrigger,Tooltip } from '@radix-ui/react-tooltip'
import React from 'react'
import { ReactNode } from 'react'

interface Props{
    children:ReactNode,
    content:ReactNode,
    side?: "top" | "bottom" | "left" | "right"
}

const TooltipWrapper = (props:Props) => {
    if(!props.content) return props.children
  return (
    <TooltipProvider delayDuration={0}>
        <Tooltip>
            <TooltipTrigger asChild>
                {props.children}
            </TooltipTrigger>
            <TooltipContent side={props.side}>
                {props.content}
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
  )
}

export default TooltipWrapper