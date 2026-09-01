import React from 'react'
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server'
import Editor from '../../_components/Editor';

// Workflow execution is kicked off from this route via the RunWorkflow server
// action, so the segment needs headroom for a full scrape to finish.
export const maxDuration = 60;
async function Page({params}:{params:Promise<{workflowId:string}>}){
    const {workflowId}=await params;
    const{userId}=await auth();
    if(!userId) return(<div>Unauthenticated</div>)
        const workflow=await prisma.workflow.findUnique({
            where:{
                id:workflowId,
                userId
            }
        })
        if(!workflow){
            return <div>Workflow not found</div>
        }
  return (
    <Editor workflow={workflow} />
  )
}

export default Page