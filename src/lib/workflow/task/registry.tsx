import { TaskType } from "../../../../types/task";
import { WorkflowTask } from "../../../../types/workflow";
import { AddPropertyToJsonTask } from "./AddPropertyToJson";
import { ClickElementTask } from "./ClickElement";
import { DeliverViaWebhookTask } from "./DeliverViaWebhook";
import { ExtractDataWithAITask } from "./ExtractDataWithAI";
import { ExtractTextFromElementTask } from "./ExtractTextFromElement";
import { FillInputTask } from "./FillInput";
import { LaunchBrowserTask } from "./LaunchBrowser";
import { PageToHtmlTask } from "./PageToHtml";
import { ReadPropertyFromJsonTask } from "./ReadPropertyFromJson";
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
    WAIT_FOR_ELEMENT:WaitForElementTask,
    DELIVER_VIA_WEBHOOK:DeliverViaWebhookTask,
    EXTRACT_DATA_WITH_AI:ExtractDataWithAITask,
    READ_PROPERTY_FROM_JSON:ReadPropertyFromJsonTask,
    ADD_PROPERTY_TO_JSON:AddPropertyToJsonTask
}