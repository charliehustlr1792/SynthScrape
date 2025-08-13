import { LaunchBrowserTask } from "./LaunchBrowser";
import { PageToHtmlTask } from "./PageToHtml";

//groups multiple tasks
export const TaskRegistry={
    LAUNCH_BROWSER:LaunchBrowserTask,
    PAGE_TO_HTML:PageToHtmlTask
}