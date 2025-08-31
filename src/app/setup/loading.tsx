import Logo from "@/components/Logo";
import { Separator } from "@/components/ui/separator";

export default function loading(){
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center gap-4">
            <Logo iconSize={50} fontSize="text-3xl"/>
            <Separator className="max-w-xs"/>
            
        </div>
    )
}