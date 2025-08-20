"use client"
import useExecutionPlan from '@/components/hooks/useExecutionPlan'
import { Button } from '@/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import { DownloadIcon, PlayIcon, UploadIcon } from 'lucide-react'
import React from 'react'
import { RunWorkflow } from '../../../../../actions/workflows/runWorkflow'
import { toast } from 'sonner'
import { useReactFlow } from '@xyflow/react'
import { PublishWorkflow } from '../../../../../actions/workflows/publishWorkflows'
import { UnpublishWorkflow } from '../../../../../actions/workflows/unpublishWorkflow'

const UnpublishButton = ({workflowId}:{workflowId:string}) => {
  const generate=useExecutionPlan()
  const {toObject}=useReactFlow()

  const mutation=useMutation({
    mutationFn:UnpublishWorkflow,
    onSuccess:()=>{
      toast.success("Workflow unpublished",{id:workflowId})
    },
    onError:()=>{
      toast.error("Something went wrong",{
        id:workflowId
      })
    }
  })

  return (
    <Button 
    variant={"outline"} 
    className='flex items-center gap-2'
    disabled={mutation.isPending}
    onClick={()=>{
      toast.loading("Unpublishing workflow...",{id:workflowId})
      mutation.mutate(workflowId)
    }}
    >
        <DownloadIcon size={16} className='stroke-orange-500'/>
        Unpublish
    </Button>
  )
}

export default UnpublishButton