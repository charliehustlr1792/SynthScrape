import prisma from '@/lib/prisma';
import { UserPurchase } from './../../src/generated/prisma/index.d';
"use server"

import { auth } from "@clerk/nextjs/server"

export async function GetUserPurchaseHistory(){
    const {userId}=await auth()
    if(!userId){
        throw new Error("unauthenticate")
    }

    return prisma.userPurchase.findMany({
        where:{userId},
        orderBy:{
            date:"desc"
        }
    })
}