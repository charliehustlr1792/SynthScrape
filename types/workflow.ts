import { Workflow } from './../src/generated/prisma/index.d';
import { LucideProps } from "lucide-react"
import { TaskType,TaskParam } from "./task"
import { AppNode } from "./appNode"

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

export type WorkflowExecutionPlan=WorkflowExecutionPlanPhase[]

export type WorkflowExecutionPlanPhase={
    phase:number
    nodes:AppNode[]
}

export enum WorkflowExecutionStatus{
    PENDING="PENDING",
    RUNNING="RUNNING",
    COMPLETED="COMPLETED",
    FAILED="FAILED"
}

export enum WorkflowExecutionTrigger{
    MANUAL="MANUAL",
    CRON="CRON"
}

export enum ExecutionPhaseStatus{
    CREATED="CREATED",
    PENDING="PENDING",
    RUNNING="RUNNING",
    COMPLETED="COMPLETED",
    FAILED="FAILED"
}
