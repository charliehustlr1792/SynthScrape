"use server"

import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { WorkflowExecutionPlan } from "../../types/workflow"
import { FlowToExecutionPlan } from "@/lib/workflow/executionPlan"

export async function RunWorkflow(form:{
    workflowId:string
    flowDefinition?:string
}) {
    const {userId}= await auth()
    if(!userId){
        throw new Error("Unauthenticated")
    }
    
    const {workflowId,flowDefinition}=form
    if(!workflowId){
        throw new Error("WorkflowId is required")
    }

    const workflow=await prisma.workflow.findUnique({
        where:{
            userId,
            id:workflowId
        }
    })
    if(!workflow){
        throw new Error("Workflow not found")
    }

    let executionPlan:WorkflowExecutionPlan
    if(!flowDefinition){
        throw new Error("Flow definition is not defined")
    }

    const flow=JSON.parse(flowDefinition)
    const result=FlowToExecutionPlan(flow.nodes,flow.edges)
    if(result.error){
        throw new Error("Flow definition is not valid")
    }

    if(!result.executionPlan){
        throw new Error("No execution plan generated")
    }

    executionPlan=result.executionPlan
}