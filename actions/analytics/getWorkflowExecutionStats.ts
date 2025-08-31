"use server"

import { auth } from "@clerk/nextjs/server";
import { Period } from "../../types/analytics";
import { PeriodToDateRange } from "@/lib/helpers/dates";
import prisma from "@/lib/prisma";
import { eachDayOfInterval, format } from "date-fns";
import { WorkflowExecutionStatus } from "../../types/workflow";

type Stats=Record<string,{
        sucess:number;
        failed:number;
    }>

export async function GetWorkflowExecutionStats(period:Period){
    const {userId}=await auth()
    if(!userId){
        throw new Error("unauthenticated")
    }

    const dateRange=PeriodToDateRange(period)
    const executions=await prisma.workflowExecution.findMany({
        where:{
            userId,
            startedAt:{
                gte:dateRange.startDate,
                lte:dateRange.endDate
            }
        }
    })

    const dateFormat="yyyy-MM-dd"

    const stats:Stats=eachDayOfInterval({
        start:dateRange.startDate,
        end:dateRange.endDate,
    }).map((date)=>format(date,dateFormat)).reduce((acc,date)=>{
        acc[date]={
            success:0,
            failed:0,
        }
        return acc
    },{} as any)

    /* [
        "2024-08-01":{
            sucess:22,
            failed:4
        }
    ] */

    executions.forEach((execution)=>{
        const date=format(execution.startedAt!,dateFormat)
        if(execution.status===WorkflowExecutionStatus.COMPLETED){
            stats[date].sucess+=1
        }
        if(execution.status===WorkflowExecutionStatus.FAILED){
            stats[date].failed+=1
        }
    })
    
    const result=Object.entries(stats).map(([date,infos])=>({
        date,
        ...infos
    }))
    return result
}