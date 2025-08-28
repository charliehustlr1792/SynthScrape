import { ExecutionEnvironment } from "../../../../types/executor";
import { TaskType } from "../../../../types/task";
import { WorkflowTask } from "../../../../types/workflow";
import { ClickELementExecutor } from "./ClickElementExecutor";
import { DeliverViaWebhookExecutor } from "./DeliverViaWebhookExecutor";
import { ExtractTextFromElementExecutor } from "./ExtactTextFromElementExecutor";
import { FillInputExecutor } from "./FillInputExecutor";
import { LaunchBrowserExecutor } from "./LaunchBrowserExecutor";
import { PageToHtmlExecutor } from "./PageToHtmlExecutor";
import { WaitForELementExecutor } from "./WaitForElementExecutor";

type ExecutorFn<T extends WorkflowTask>=(
    environment:ExecutionEnvironment<T>
)=>Promise<boolean>

type RegistryType={
    [K in TaskType]:ExecutorFn<WorkflowTask & {type:K}>
}

export const ExecutorRegistry:RegistryType={
    LAUNCH_BROWSER:LaunchBrowserExecutor,
    PAGE_TO_HTML:PageToHtmlExecutor,
    EXTRACT_TEXT_FROM_ELEMENT:ExtractTextFromElementExecutor,
    FILL_INPUT:FillInputExecutor,
    CLICK_ELEMENT:ClickELementExecutor,
    WAIT_FOR_ELEMENT:WaitForELementExecutor,
    DELIVER_VIA_WEBHOOK:DeliverViaWebhookExecutor
}