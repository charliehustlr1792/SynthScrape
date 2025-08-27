import { TaskType } from "../../../../types/task";
import { WorkflowTask } from "../../../../types/workflow";
import { ClickElementTask } from "./ClickElement";
import { ExtractTextFromElementTask } from "./ExtractTextFromElement";
import { FillInputTask } from "./FillInput";
import { LaunchBrowserTask } from "./LaunchBrowser";
import { PageToHtmlTask } from "./PageToHtml";
import { WaitForElementTask } from "./WaitForElement";


type Registry={
    [k in TaskType]:WorkflowTask & {type:k}
}

//groups multiple tasks
export const TaskRegistry:Registry={
    LAUNCH_BROWSER:LaunchBrowserTask,
    PAGE_TO_HTML:PageToHtmlTask,
    EXTRACT_TEXT_FROM_ELEMENT:ExtractTextFromElementTask,
    FILL_INPUT:FillInputTask,
    CLICK_ELEMENT:ClickElementTask,
    WAIT_FOR_ELEMENT:WaitForElementTask
}