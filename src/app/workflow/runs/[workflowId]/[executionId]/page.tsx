import Topbar from "@/app/workflow/_components/topbar/Topbar";
import { Loader2Icon } from "lucide-react";
import { Suspense } from "react";
import { GetWorkflowExecutionWithPhases } from "../../../../../../actions/workflows/getWorkflowExecutionWithPhases";
import ExecutionViewer from "./_components/ExecutionViewer";

async function ExecutionViewsPage({
    params
}:{
    params:Promise<{
        executionId:string;
        workflowId:string
    }>
}){
    return(
        <div className="flex flex-col h-screen w-full overflow-hidden">
            <Topbar
                workflowId={(await params).workflowId}
                title="Workflow run details"
                subTitle={`Run ID:${(await params).executionId}`}
                hideButtons
            />
            <section className="flex h-full overflow-auto">
                <Suspense
                 fallback={
                    <div className="flex w-full items-center justify-center">
                        <Loader2Icon className="h-10 w-10 animate-spin stroke-primary"/>
                    </div>
                 }
                 >
                    <ExecutionViewerWrapper executionId={(await params).executionId}/>
                 </Suspense>
            </section>
        </div>
    )
}

export default ExecutionViewsPage

async function ExecutionViewerWrapper({
    executionId
}:{
    executionId:string
}){
    const workflowExecution=await GetWorkflowExecutionWithPhases(executionId)
    if(!workflowExecution){
        return <div>Not Found</div>
    }
    return <ExecutionViewer initialData={workflowExecution}/>
}