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

const labelColors:Record<WorkflowExecutionStatus,string>={
  PENDING:'text-slate-400',
  RUNNING:'text-yellow-400',
  FAILED:'text-red-400',
  COMPLETED:'text-emarald-600'
}

export function ExecutionStatusLabel({status}:{status:WorkflowExecutionStatus}){
  return <span className={cn("lowercase",labelColors[status])}>{status}</span>
}