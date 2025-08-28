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
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import { DeleteCredential } from "../../../../../actions/credentials/deleteCredential";


interface Props{
    name:string
}

function DeleteCredentialDialog({name}:Props){
    const [open,setOpen]=useState(false)
    const [confirmText,setConfirmText]=useState("")

    const deleteMutation=useMutation({
        mutationFn:DeleteCredential,
        onSuccess:()=>{
            toast.success("Credential deleted successfully",{id:name})
            setConfirmText("")
        },
        onError:()=>{
            toast.error("Something went wrong while deleting credential",{id:name})
        }
    })

    return(
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant={"destructive"} size={"icon"}>
                    <XIcon size={18}/>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div>
                            <span>If you delete this credential, you will not be able to recover it.</span>
                            <div className="flex flex-col py-4 gap-2">
                                <span>
                                    If you are sure, enter <b>{name}</b>
                                </span>
                                <Input value={confirmText} onChange={(e)=>setConfirmText(e.target.value)}/>
                            </div>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={()=>setConfirmText("")}>Cancel</AlertDialogCancel>
                    <AlertDialogAction disabled={confirmText!==name || deleteMutation.isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={(e)=>{
                        toast.loading("Deleting credential...",{id:name})
                        deleteMutation.mutate(name)
                    }}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DeleteCredentialDialog