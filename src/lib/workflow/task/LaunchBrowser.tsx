import { GlobeIcon, LucideProps } from "lucide-react";
import { TaskParamType, TaskType } from "../../../../types/task";

export const LaunchBrowserTask={
    type:TaskType.LAUNCH_BROWSER,
    label:"Launch browser",
    icon:(props:LucideProps)=>(
        <GlobeIcon className="stroke-pink-400" {...props} />
    ),
    isEntryPoint:true,
    inputs:[
        {
            name:"Website Url",
            type:TaskParamType.BROWSER_INSTANCE,
            required:true,
        }
    ],
    outputs:[{name:"Web page",type:TaskParamType.BROWSER_INSTANCE}]
}