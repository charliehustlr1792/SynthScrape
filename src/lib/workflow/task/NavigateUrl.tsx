import { Link2Icon, MousePointerClick} from "lucide-react";
import { TaskParamType, TaskType } from "../../../../types/task";
import { WorkflowTask } from "../../../../types/workflow";

export const NavigateUrlTask={
    type:TaskType.NAVIGATE_URL,
    label:"Navigate Url",
    icon:(props)=>(
        <Link2Icon className="stroke-orange-400" {...props} />
    ),
    isEntryPoint:false,
    credits:2,
    inputs:[
        {
            name:"Web page",
            type:TaskParamType.BROWSER_INSTANCE,
            required:true,
        },
        {
            name:"URL",
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