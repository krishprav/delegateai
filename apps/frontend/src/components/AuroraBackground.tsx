import React from "react";
import { cn } from "@/lib/utils";

interface AuroraBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

export function AuroraBackground({ className, children, ...props }: AuroraBackgroundProps) {
    return (
        <div
            className={cn(
                "min-h-screen bg-[#020202] relative overflow-hidden flex flex-col items-center justify-center font-sans selection:bg-purple-500/30",
                className
            )}
            {...props}
        >
            {/* Enhanced Background - Minimal */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-indigo-950/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[15000ms]" /> */}
                {/* <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-purple-950/5 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[18000ms]" /> */}
                {/* <div className="absolute top-[30%] right-[20%] w-[50vw] h-[50vw] bg-slate-900/5 rounded-full blur-[150px] mix-blend-screen animate-pulse duration-[20000ms]" /> */}

                {/* Subtle grid mesh */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

                {/* Noise overlay for texture */}
                <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150"></div>
            </div>

            <div className="relative z-10 w-full flex flex-col items-center">
                {children}
            </div>
        </div>
    );
}
