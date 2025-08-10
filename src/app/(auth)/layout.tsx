import React from 'react'
import Logo from '@/components/Logo'
const layout = ({children}:{children:React.ReactNode}) => {
  return (
    <div className="flex flex-col justify-center items-center h-screen gap-4">
        <Logo/>
        {children}
    </div>
  )
}

export default layout