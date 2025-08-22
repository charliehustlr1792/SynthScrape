"use client"

import React, { useState } from 'react'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CalendarIcon, TriangleAlertIcon } from 'lucide-react'
import CustomDialogHeader from '@/components/CustomDialogHeader'
import { Input } from '@/components/ui/input'
import { useMutation } from '@tanstack/react-query'
import { UpdateWorkflowCron } from '../../../../../actions/workflows/updateWorkflowCron'
import { toast } from 'sonner'

const SchedulerDialog = ({ workflowId }: { workflowId: string }) => {
  const [cron, setCron] = useState("")
  const [validCron,setValidCron]=useState(false)
  
  const mutation = useMutation({
    mutationFn: UpdateWorkflowCron,
    onSuccess: () => { toast.success("Schedule updated successfully", { id: "cron" }) },
    onError: () => {
      toast.error("Something went wrong", { id: "cron" })
    }
  })

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"link"} size={"sm"} className={cn("text-sm p-0 h-auto")}>
          <div className="flex items-center gap-1">
            <TriangleAlertIcon className='h-3 w-3' />Set schedule
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className='px-0'>
        <CustomDialogHeader title="Schedule workflow execution" icon={CalendarIcon} />
        <div className="p-6 space-y-4">
          <p className='text-muted-foreground tex-sm'>
            Specify a cron expresssion to schedule periodic workflow execution. All time are in UTC
          </p>
          <Input placeholder="Eg. * * * * *" value={cron} onChange={(e) => setCron(e.target.value)} />
        </div>
        <DialogFooter className='px-6 gap-2'>
          <DialogClose asChild>
            <Button variant={"secondary"} className='w-full'>Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button className='w-full' disabled={mutation.isPending}
              onClick={() => {
                toast.loading("Saving...", { id: "cron" })
                mutation.mutate({ id: workflowId, cron })
              }}>
              Save
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default SchedulerDialog