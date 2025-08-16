import puppeteer from "puppeteer"
import { ExecutionEnvironment } from "../../../../types/executor";
import { LaunchBrowserTask } from "../task/LaunchBrowser";

export async function LaunchBrowserExecutor(environment:ExecutionEnvironment<typeof LaunchBrowserTask>):Promise<boolean> {
    try{
        const websiteUrl=environment.getInput("Website Url")
        const browser=await puppeteer.launch({
            headless:true
        })
        await browser.close();
        return true;
    }catch(error){
        console.error(error)
        return false
    }
}