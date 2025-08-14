import { TaskType } from "../../../../types/task";
import { WorkflowTask } from "../../../../types/workflow";
import { ExtractTextFromElementTask } from "./ExtractTextFromElement";
import { LaunchBrowserTask } from "./LaunchBrowser";
import { PageToHtmlTask } from "./PageToHtml";


type Registry={
    [k in TaskType]:WorkflowTask & {type:k}
}

//groups multiple tasks
export const TaskRegistry:Registry={
    LAUNCH_BROWSER:LaunchBrowserTask,
    PAGE_TO_HTML:PageToHtmlTask,
    EXTRACT_TEXT_FROM_ELEMENT:ExtractTextFromElementTask
}