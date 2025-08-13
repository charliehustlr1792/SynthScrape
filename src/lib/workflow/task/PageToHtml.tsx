import { CodeIcon, LucideProps } from "lucide-react";
import { TaskParamType, TaskType } from "../../../../types/task";

export const PageToHtmlTask={
    type:TaskType.PAGE_TO_HTML,
    label:"Get html from page",
    icon:(props:LucideProps)=>(
        <CodeIcon className="stroke-pink-400" {...props} />
    ),
    isEntryPoint:false,
    inputs:[
        {
            name:"Web Page",
            type:TaskParamType.BROWSER_INSTANCE,
            required:true,
            hideHandle:true
        }
    ],
    outputs:[
        {
            name:"Html",
            type:TaskParamType.STRING
        },{
            name:"Web Page",
            type:TaskParamType.BROWSER_INSTANCE
        }
    ]
}