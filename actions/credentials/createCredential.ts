"use server"

import { auth } from "@clerk/nextjs/server"
import { createCredentialSchema, createCredentialSchemaType } from "../../schema/credential"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { symmetricEncrypt } from "@/lib/encryption"

export async function CreateCredential(form:createCredentialSchemaType){
    const {success,data}=createCredentialSchema.safeParse(form)
    if(!success){
        throw new Error("invalid form data")
    }

    const {userId}=await auth()
    if(!userId){
        throw new Error("unauthenticated")
    }

    const encryptedValue=symmetricEncrypt(data.value)
    const result=await prisma.credential.create({
        data:{
            userId,
            name:data.name,
            value:encryptedValue,
        }
    })

    if(!result){
        throw new Error("failed to create credential")
    }

    revalidatePath("/credentials")
} 