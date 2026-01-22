import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { useState } from "react";
import { Zap, Webhook, Clock, Hand } from "lucide-react";
import { useWorkflowStore, type TriggerI } from "@/store/workflowStore";

export interface AddTriggerNodeData {
  label: string;
}

export function AddTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  const getTriggerIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "manual":
        return <Hand className="w-5 h-5 text-blue-400" />;
      case "webhook":
        return <Webhook className="w-5 h-5 text-green-400" />;
      case "schedule":
        return <Clock className="w-5 h-5 text-purple-400" />;
      default:
        return <Zap className="w-5 h-5 text-gray-400" />;
    }
  };
  const getTypeBadgeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "manual":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "webhook":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "schedule":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const triggers = useWorkflowStore((state) => state.triggers);

  const addTriggerNode = useWorkflowStore((state) => state.addTriggerNode);
  const handleTriggerSelect = (trigger: TriggerI) => {
    addTriggerNode(trigger);
    setIsOpen(false);
  };

  return (
    <div className="bg-[#1e1e1e] border-2 border-dashed border-white/20 rounded-lg shadow-lg flex flex-col items-center justify-center gap-2 w-24 h-24 hover:border-teal-500/50 transition-colors group">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <div className="flex flex-col items-center gap-2 cursor-pointer w-full h-full justify-center">
            <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
              <Zap className="w-4 h-4 text-teal-500" />
            </div>
            <span className="text-[10px] text-gray-400 group-hover:text-teal-400 font-medium transition-colors">
              Add Trigger
            </span>
          </div>
        </SheetTrigger>
        <SheetContent className="sm:max-w-[500px] bg-[#0A0A0A] border-l border-white/10 text-white">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-white">
              <Zap className="w-5 h-5 text-teal-400" />
              Available Triggers
            </SheetTitle>
            <SheetDescription className="text-gray-400">
              Select a trigger to start your workflow. Each trigger responds to
              different events.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-3 mt-6 max-h-[70vh] overflow-y-auto pr-2">
            {triggers && triggers.length > 0 ? (
              triggers.map((trigger, idx) => (
                <div
                  key={trigger.id || idx}
                  className="group p-3 border border-white/10 rounded-lg hover:border-teal-500/50 hover:shadow-[0_0_15px_rgba(20,184,166,0.1)] cursor-pointer transition-all duration-200 bg-white/5 hover:bg-white/10"
                  onClick={() => handleTriggerSelect(trigger)}
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-1 p-2 rounded-md bg-black/40 border border-white/10">
                      {getTriggerIcon(trigger.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <h3 className="font-semibold text-white group-hover:text-teal-400 transition-colors">
                          {trigger.name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getTypeBadgeColor(trigger.type)}`}
                        >
                          {trigger.type?.toUpperCase()}
                        </span>
                      </div>

                      {trigger.description && (
                        <p className="text-xs text-gray-400 group-hover:text-gray-300 leading-relaxed">
                          {trigger.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-white/5 rounded-lg border border-dashed border-white/10">
                <Zap className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 font-medium">
                  No triggers available
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Triggers will appear here when loaded
                </p>
              </div>
            )}
          </div>

          <SheetFooter className="mt-6 pt-4 border-t border-white/10">
            <SheetClose asChild>
              <Button variant="outline" className="w-full sm:w-auto border-white/10 text-white hover:bg-white/10 hover:text-white bg-transparent">Close</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
