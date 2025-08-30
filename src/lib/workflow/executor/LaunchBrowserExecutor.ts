import puppeteer from "puppeteer"
import { ExecutionEnvironment } from "../../../../types/executor";
import { LaunchBrowserTask } from "../task/LaunchBrowser";

export async function LaunchBrowserExecutor(environment:ExecutionEnvironment<typeof LaunchBrowserTask>):Promise<boolean> {
    try{
        const websiteUrl=environment.getInput("Website Url")
        const browser=await puppeteer.launch({
            headless:true,
            //args:["--proxy-server=brd.superproxy.io"]
        })
        environment.log.info("Browser started successfully")
        environment.setBrowser(browser)
        const page=await browser.newPage()
        //page.setViewport({width:2500,height:1440})
        /* await page.authenticate({
            username:"brd-customer-hl_7cd8f3ee-zone-synth_scrape",
            password:"dw7zjnf55oyx"
        }) */
        await page.goto(websiteUrl)
        environment.setPage(page)
        environment.log.info(`Opened page at: ${websiteUrl}`)
        return true;
    }catch(error:any){
        environment.log.error(error.message)
        return false
    }
}