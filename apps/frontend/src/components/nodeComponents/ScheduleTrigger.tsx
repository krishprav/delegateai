/* eslint-disable @typescript-eslint/no-explicit-any */
import { Handle, Position } from "@xyflow/react";
import { Clock, Settings, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useWorkflowStore } from "@/store/workflowStore";
import { toast } from "sonner";

export function ScheduledTriggerNode({ data, id }: { data: any; id: string }) {
  const [cronExpression, setCronExpression] = useState<string>(data?.cronExpression || "");
  const [isOpen, setIsOpen] = useState(false);
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const deleteNode = useWorkflowStore((state) => state.deleteNode);

  useEffect(() => {
    if (data?.autoOpen && !data?.configured) {
      setIsOpen(true);
      updateNodeData(id, { autoOpen: false });
    }
  }, [data?.autoOpen, data?.configured, id, updateNodeData]);

  // Sync state with node data ONLY when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCronExpression(data?.cronExpression || "");
    }
  }, [isOpen]);
  // Auto-save changes to store with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only update if values are different and valid
      if (cronExpression !== data?.cronExpression && cronExpression) {
        updateNodeData(id, {
          cronExpression: cronExpression.trim(),
          configured: !!cronExpression
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [cronExpression, id, updateNodeData, data?.cronExpression]);

  const handleSave = () => {
    if (!cronExpression.trim()) {
      toast.warning("Please enter cron expression");
      return;
    }

    // Basic cron validation
    const parts = cronExpression.trim().split(" ");
    if (parts.length < 5 || parts.length > 6) {
      toast.error("Invalid cron expression. Use format: * * * * * or * * * * * *");
      return;
    }

    updateNodeData(id, {
      cronExpression: cronExpression.trim(),
      configured: true,
    });

    toast.success("Schedule configured successfully");
    setIsOpen(false);
  };

  const cronPresets = [
    { label: "Every minute", value: "* * * * *" },
    { label: "Every 5 minutes", value: "*/5 * * * *" },
    { label: "Every hour", value: "0 * * * *" },
    { label: "Every day at midnight", value: "0 0 * * *" },
    { label: "Every day at 9 AM", value: "0 9 * * *" },
    { label: "Every Monday at 9 AM", value: "0 9 * * 1" },
  ];

  return (
    <div className="rounded-2xl bg-[#1e1e1e] border-2 border-emerald-500/50 hover:border-emerald-400 transition-all duration-300 shadow-[0_4px_14px_0_rgba(16,185,129,0.15)] min-w-[220px] relative group ring-1 ring-white/5">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {/* Invisible trigger */}
          <div className="hidden" />
        </DialogTrigger>
        <DialogContent className="max-w-md bg-[#141414] border-white/10 text-white shadow-2xl">
          <DialogTitle className="text-xl font-bold text-white">Configure Schedule</DialogTitle>
          <div className="space-y-6 mt-4">
            <div className="bg-[#1c1c1c] border border-white/5 p-5 rounded-xl space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 block">Cron Expression</label>
                <div className="relative">
                  <Input
                    placeholder="* * * * *"
                    value={cronExpression}
                    onChange={(e) => setCronExpression(e.target.value)}
                    className="font-mono bg-white/5 border-white/10 text-white focus:border-emerald-500/50 focus:ring-emerald-500/20 pr-10"
                  />
                  <div className="absolute right-3 top-2.5 text-xs text-gray-500 font-mono">UTC</div>
                </div>
                <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                  Format: minute hour day month weekday
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 block">Quick Presets</label>
                <div className="grid grid-cols-2 gap-2">
                  {cronPresets.map((preset) => (
                    <Button
                      key={preset.value}
                      variant="outline"
                      size="sm"
                      onClick={() => setCronExpression(preset.value)}
                      className={`text-xs justify-start border-white/5 h-auto py-2 px-3 transition-all ${cronExpression === preset.value
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl text-sm">
              <div className="font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Cron Syntax Guide
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-emerald-200/60 text-xs font-mono">
                <div>* * * * *</div>
                <div className="text-right text-white/40">min hr day mon wkday</div>
                <div>*</div>
                <div className="text-right text-white/40">every</div>
                <div>*/5</div>
                <div className="text-right text-white/40">every 5</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 shadow-lg shadow-emerald-900/20">
                Save Schedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Node Controls */}
      <div className="absolute -top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0 z-20">
        <div
          className="w-7 h-7 bg-[#252525] text-gray-300 hover:text-white border border-white/10 hover:border-emerald-500/50 rounded-full cursor-pointer p-1.5 shadow-xl transition-colors flex items-center justify-center"
          onClick={() => setIsOpen(true)}
        >
          <Settings className="w-4 h-4" />
        </div>
        <div
          className="w-7 h-7 bg-[#252525] text-red-400/80 hover:text-red-400 border border-white/10 hover:border-red-500/50 rounded-full cursor-pointer p-1.5 shadow-xl transition-colors flex items-center justify-center"
          onClick={() => deleteNode(id)}
        >
          <Trash className="w-4 h-4" />
        </div>
      </div>

      <div className="p-4 relative overflow-hidden">
        {/* Partial Gradient Background */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent opacity-50 rounded-bl-full pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border border-white/5 shadow-sm transition-colors ${data?.cronExpression ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-500'}`}>
            <Clock className="w-6 h-6 transform transition-transform group-hover:scale-110 duration-300" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-white font-bold text-sm truncate leading-tight">
              {data.label || "Scheduled Trigger"}
            </span>
            <span className="text-[10px] text-gray-400 font-medium truncate uppercase tracking-wider mt-1">
              Trigger
            </span>

            {/* Mini Status Dot */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${data.cronExpression ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className={`text-[9px] font-medium ${data.cronExpression ? 'text-emerald-500' : 'text-amber-500'}`}>
                {data.cronExpression ? data.cronExpression : 'Needs Config'}
              </span>
            </div>
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
