"use server"

import { auth } from "@clerk/nextjs/server";
import { PackId } from "../../types/billing";

export async function PurchaseCredits(packId:PackId){
    const {userId}=await auth()
    if(!userId){
        throw new Error("unauthenticated")
    }
}