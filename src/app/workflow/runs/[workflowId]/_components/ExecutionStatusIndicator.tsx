import React from 'react'
import { WorkflowExecutionStatus } from '../../../../../../types/workflow'
import { cn } from '@/lib/utils'

const indicatorColors:Record<WorkflowExecutionStatus,string>={
    PENDING:"bg-slate-400",
    RUNNING:"bg-yellow-400",
    FAILED:"bg-red-400",
    COMPLETED:"bg-emerald-600"
}
const ExecutionStatusIndicator = ({status}:{status:WorkflowExecutionStatus}) => {
  return (
    <div className={cn("w-2 h-2 rounded-full",indicatorColors[status])}/>
  )
}

export default ExecutionStatusIndicator