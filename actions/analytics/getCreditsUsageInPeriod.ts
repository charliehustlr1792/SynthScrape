"use server"

import { auth } from "@clerk/nextjs/server";
import { Period } from "../../types/analytics";
import { PeriodToDateRange } from "@/lib/helpers/dates";
import prisma from "@/lib/prisma";
import { eachDayOfInterval, format } from "date-fns";
import { ExecutionPhaseStatus} from "../../types/workflow";

type Stats=Record<string,{
        sucess:number;
        failed:number;
    }>

const {COMPLETED,FAILED}=ExecutionPhaseStatus

export async function GetCreditsUsageInPeriod(period:Period){
    const {userId}=await auth()
    if(!userId){
        throw new Error("unauthenticated")
    }

    const dateRange=PeriodToDateRange(period)
    const executionPhases=await prisma.executionPhase.findMany({
        where:{
            userId,
            startedAt:{
                gte:dateRange.startDate,
                lte:dateRange.endDate
            },
            status:{
                in:[COMPLETED,FAILED]
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

    executionPhases.forEach((phase)=>{
        const date=format(phase.startedAt!,dateFormat)
        if(phase.status===COMPLETED){
            stats[date].sucess+=phase.creditsConsumed || 0
        }
        if(phase.status===FAILED){
            stats[date].failed+=phase.creditsConsumed || 0
        }
    })
    
    const result=Object.entries(stats).map(([date,infos])=>({
        date,
        ...infos
    }))
    return result
}