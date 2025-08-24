import { MousePointerClick} from "lucide-react";
import { TaskParamType, TaskType } from "../../../../types/task";
import { WorkflowTask } from "../../../../types/workflow";

export const ClickElementTask={
    type:TaskType.CLICK_ELEMENT,
    label:"Click Element",
    icon:(props)=>(
        <MousePointerClick className="stroke-orange-400" {...props} />
    ),
    isEntryPoint:false,
    credits:1,
    inputs:[
        {
            name:"Web page",
            type:TaskParamType.BROWSER_INSTANCE,
            required:true,
        },
        {
            name:"Selector",
            type:TaskParamType.STRING,
            required:true,
        }
    ] as const ,
    outputs:[
        {
            name:"Web Page",
            type:TaskParamType.STRING
        }
    ] as const 
} satisfies WorkflowTask