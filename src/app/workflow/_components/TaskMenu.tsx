"use client"
import { Accordion, AccordionContent,AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import React from 'react'
import { TaskType } from '../../../../types/task'
import { TaskRegistry } from '@/lib/workflow/task/registry'
import { Button } from '@/components/ui/button'

const TaskMenu = () => {
  return (
    <aside className='w-[340px] min-w-[340px] max-w-[340px] border-r-2 border-separate h-full p-2 px-4 overflow-auto'>
        <Accordion type="multiple" className='w-full' defaultValue={["extraction","interactions","timing","results"]}>
            <AccordionItem value="interactions">
                <AccordionTrigger className='font-bold'>
                    User interactions
                </AccordionTrigger>
                <AccordionContent className='flex flex-col gap-1'>
                    <TaskMenuButton taskType={TaskType.FILL_INPUT} />
                    <TaskMenuButton taskType={TaskType.CLICK_ELEMENT} />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="extraction">
                <AccordionTrigger className='font-bold'>
                    Data extraction
                </AccordionTrigger>
                <AccordionContent className='flex flex-col gap-1'>
                    <TaskMenuButton taskType={TaskType.PAGE_TO_HTML} />
                    <TaskMenuButton taskType={TaskType.EXTRACT_TEXT_FROM_ELEMENT} />
                    <TaskMenuButton taskType={TaskType.EXTRACT_DATA_WITH_AI} />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="timing">
                <AccordionTrigger className='font-bold'>
                    Timing controls
                </AccordionTrigger>
                <AccordionContent className='flex flex-col gap-1'>
                    <TaskMenuButton taskType={TaskType.WAIT_FOR_ELEMENT} />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="results">
                <AccordionTrigger className='font-bold'>
                    Result delivery
                </AccordionTrigger>
                <AccordionContent className='flex flex-col gap-1'>
                    <TaskMenuButton taskType={TaskType.DELIVER_VIA_WEBHOOK} />
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </aside>
  )
}


function TaskMenuButton({taskType}:{taskType:TaskType}){
    const task=TaskRegistry[taskType];
    const onDragStart=(event:React.DragEvent,type:TaskType)=>{
        event.dataTransfer.setData("application/reactflow",type);
        event.dataTransfer.effectAllowed="move"
    }
    return(
        <Button
        variant={"secondary"}
        className='flex justify-between items-center gap-2 border w-full'
        draggable
        onDragStart={(event)=>onDragStart(event,taskType)}>
            <div className="flex p-2">
                <task.icon size={20}/>
                {task.label}
            </div>
        </Button>
    )
    
}
export default TaskMenu