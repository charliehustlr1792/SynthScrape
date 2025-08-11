import React,{useState} from 'react'
import{Dialog,DialogContent,DialogTrigger} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
const CreateWorkflowDialogue = ({triggerText}:{triggerText?:string}) => {
    const[open,setOpen]=useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button>{triggerText?? "Create workflow"}</Button>
        </DialogTrigger>
    </Dialog>
  )
}

export default CreateWorkflowDialogue