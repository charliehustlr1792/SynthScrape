"use client"

import React, { useEffect, useState } from 'react'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CalendarIcon, ClockIcon, TriangleAlertIcon } from 'lucide-react'
import CustomDialogHeader from '@/components/CustomDialogHeader'
import { Input } from '@/components/ui/input'
import { useMutation } from '@tanstack/react-query'
import { UpdateWorkflowCron } from '../../../../../actions/workflows/updateWorkflowCron'
import { toast } from 'sonner'
import cronstrue from 'cronstrue'
import {CronExpressionParser} from 'cron-parser'
import { RemoveWorkflowSchedule } from '../../../../../actions/workflows/removeWorkflowSchedule'
import { Separator } from '@/components/ui/separator'

const SchedulerDialog = (props: { cron: string | null, workflowId: string }) => {
  const [cron, setCron] = useState(props.cron || "")
  const [validCron, setValidCron] = useState(false)
  const [readableCron, setReadableCron] = useState("")

  const mutation = useMutation({
    mutationFn: UpdateWorkflowCron,
    onSuccess: () => { toast.success("Schedule updated successfully", { id: "cron" }) },
    onError: () => {
      toast.error("Something went wrong", { id: "cron" })
    }
  })

  const removeScheduleMutation = useMutation({
    mutationFn: RemoveWorkflowSchedule,
    onSuccess: () => { toast.success("Schedule updated successfully", { id: "cron" }) },
    onError: () => {
      toast.error("Something went wrong", { id: "cron" })
    }
  })

  useEffect(() => {
    try {
      CronExpressionParser.parse(cron)
      const humanCronStr = cronstrue.toString(cron)
      setValidCron(true)
      setReadableCron(humanCronStr)
    } catch (err) {
      setValidCron(false)
    }
  },[cron])

  const workflowHasValidCron=props.cron && props.cron.length>0
  const readableSavedCron=workflowHasValidCron && cronstrue.toString(props.cron!)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"link"} size={"sm"} className={cn("text-sm p-0 h-auto text-orange-500", workflowHasValidCron && "text-primary")}>
          {workflowHasValidCron && (
            <div className="flex items-center gap-2">
              <ClockIcon />
              {readableSavedCron}
            </div>
          )}
          {!workflowHasValidCron && (
            <div className="flex items-center gap-1">
              <TriangleAlertIcon className='h-3 w-3' />Set schedule
            </div>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className='px-0'>
        <CustomDialogHeader title="Schedule workflow execution" icon={CalendarIcon} />
        <div className="p-6 space-y-4">
          <p className='text-muted-foreground tex-sm'>
            Specify a cron expresssion to schedule periodic workflow execution. All time are in UTC
          </p>
          <Input placeholder="Eg. * * * * *" value={cron} onChange={(e) => setCron(e.target.value)} />
          <div className={cn("bg-accent rounded-md p- bordere text-sm bordere-destructive text-destructive", validCron && "border-primary text-primary")}>{validCron ? readableCron : "Not a valid cron expression"}</div>
          {workflowHasValidCron && (
            <DialogClose asChild>
              <div>
                <Button
                className='w-full text-destructive border-destructive hover:text-destructive'
                variant={"outline"}
                disabled={mutation.isPending || removeScheduleMutation.isPending}
                onClick={()=>{
                  toast.loading("Removing schedule...",{id:"cron"})
                  removeScheduleMutation.mutate(props.workflowId)
                }}>
                  Remove current schedule
                </Button>
                <Separator className="my-4"/>
              </div>
            </DialogClose>
          )}
        </div>
        <DialogFooter className='px-6 gap-2'>
          <DialogClose asChild>
            <Button variant={"secondary"} className='w-full'>Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button className='w-full' disabled={mutation.isPending || !validCron}
              onClick={() => {
                toast.loading("Saving...", { id: "cron" })
                mutation.mutate({ id: props.workflowId, cron })
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