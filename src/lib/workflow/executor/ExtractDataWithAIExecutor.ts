import prisma from "@/lib/prisma";
import { ExecutionEnvironment } from "../../../../types/executor";
import { ClickElementTask } from "../task/ClickElement";
import { ExtractDataWithAITask } from "../task/ExtractDataWithAI";
import { FillInputTask } from "../task/FillInput";
import { symmetricDecrypt } from "@/lib/encryption";

export async function ExtractDataWithAIExecutor(environment:ExecutionEnvironment<typeof ExtractDataWithAITask>):Promise<boolean> {
    try{
        const credentials=environment.getInput("Credentials")
        if(!credentials){
            environment.log.error("input->credentials not defined")
        }

        const prompt=environment.getInput("Prompt")
        if(!prompt){
            environment.log.error("input->prompt not defined")
        }

        const content=environment.getInput("Content")
        if(!content){
            environment.log.error("input->content not defined")
        }

        //get credentials from db 
        const credential=await prisma.credential.findUnique({
            where:{id:credentials}
        })

        if(!credential){
            environment.log.error("credential not found")
            return false
        }

        const plainCredentialValue=symmetricDecrypt(credential.value)
        if(!plainCredentialValue){
            environment.log.error("cannot decrypt credential")
            return false
        }

        const mockExtractedData={
            usernameSelector:"#username",
            passwordSelector:"#password",
            loginSelector:"body > div > form > input.btn.btn-primary"
        }

        environment.setOutput("Extracted data",JSON.stringify(mockExtractedData))
        return true 
    }catch(error:any){
        environment.log.error(error.message)
        return false
    }
}