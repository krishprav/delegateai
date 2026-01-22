/* eslint-disable @typescript-eslint/no-explicit-any */
import { Handle, Position } from "@xyflow/react";
import { Pointer } from "lucide-react";

export function ManualTriggerNode({ data }: { data: any }) {
  return (
    <div className="rounded-2xl bg-[#1e1e1e] border-2 border-orange-500/50 hover:border-orange-400 transition-all duration-300 shadow-[0_4px_14px_0_rgba(249,115,22,0.15)] min-w-[200px] relative group ring-1 ring-white/5">

      <div className="p-4 flex items-center gap-4 relative z-10">
        <div className="h-12 w-12 rounded-xl bg-orange-500/20 flex items-center justify-center border border-white/5 shadow-sm text-orange-400">
          <Pointer className="w-6 h-6 transform transition-transform group-hover:scale-110 duration-300" />
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <div className="text-white font-bold text-sm truncate">{data.label || "Manual Trigger"}</div>

          {/* Mini Status Dot */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
            </span>
            <span className="text-[9px] uppercase tracking-wider text-orange-500 font-medium">Click to Run</span>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-[#1e1e1e] border-2 border-white/50 transition-transform hover:scale-125 hover:border-white"
      />
    </div>
  );
}