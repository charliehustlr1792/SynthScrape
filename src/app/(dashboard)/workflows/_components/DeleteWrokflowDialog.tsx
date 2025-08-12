import { AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
 } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { DeleteWorkflow } from "../../../../../actions/workflows/deleteWorkflow";
import { toast } from "sonner";


interface Props{
    open:boolean;
    setOpen:(open:boolean) =>void;
    workflowName:string
    workflowId:string
}

function DeleteWorkflowDialog({open,setOpen,workflowName,workflowId}:Props){
    const [confirmText,setConfirmText]=useState("")

    const deleteMutation=useMutation({
        mutationFn:DeleteWorkflow,
        onSuccess:()=>{
            toast.success("Workflow deleted successfully",{id:workflowId})
            setConfirmText("")
        },
        onError:()=>{
            toast.error("Something went wrong while deleting workflow",{id:workflowId})
        }
    })

    return(
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div>
                            <span>If you delete this workflow, you will not be able to recover it.</span>
                            <div className="flex flex-col py-4 gap-2">
                                <span>
                                    If you are sure, enter <b>{workflowName}</b>
                                </span>
                                <Input value={confirmText} onChange={(e)=>setConfirmText(e.target.value)}/>
                            </div>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={()=>setConfirmText("")}>Cancel</AlertDialogCancel>
                    <AlertDialogAction disabled={confirmText!==workflowName || deleteMutation.isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={(e)=>{
                        toast.loading("Deleting workflow...",{id:workflowId})
                        deleteMutation.mutate(workflowId)
                    }}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DeleteWorkflowDialog