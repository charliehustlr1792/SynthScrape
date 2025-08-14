import { LucideProps } from "lucide-react"
import { TaskType,TaskParam } from "./task"

export enum WorkflowStatus{
    DRAFT="DRAFT",
    PUBLISHED="PUBLISHED"
}

export type WorkflowTask={
    label:string
    icon:React.FC<LucideProps>
    type:TaskType
    isEntryPoint?:boolean
    inputs:TaskParam[]
    outputs:TaskParam[]
    credits:number
}