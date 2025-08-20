"use client"

import { useState } from "react"
import {QueryClient,QueryClientProvider} from "@tanstack/react-query"
import NextTopLoader from 'nextjs-toploader'
const AppProvider = ({children}:{children:React.ReactNode}) => {
    const [queryClient]=useState(()=>new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <NextTopLoader color="#10b981" showSpinner={false}/>
        {children}
        {/* <ReactQueryDevtools/> */}
    </QueryClientProvider>
  )
}

export default AppProvider