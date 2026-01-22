/* eslint-disable @typescript-eslint/no-explicit-any */
import { Handle, Position } from "@xyflow/react";
import { Webhook, Settings, Trash, Copy } from "lucide-react";
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
import { BACKEND_URL } from "@/config/api";
import { toast } from "sonner";

export function WebhookTriggerNode({ data, id }: { data: any, id: string }) {
  const [webhookName, setWebhookName] = useState<string>(data?.webhookName || "");
  const [isOpen, setIsOpen] = useState(false);
  const { workflowId } = useWorkflowStore();

  const webhookUrl = workflowId
    ? `${BACKEND_URL}/api/v1/webhook/${workflowId}/${id}`
    : `${BACKEND_URL}/api/v1/webhook/[WORKFLOW_ID]/${id}`;

  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const deleteNode = useWorkflowStore((state) => state.deleteNode);
  const isUrlReady = Boolean(workflowId);

  useEffect(() => {
    if (data?.autoOpen && !data?.configured) {
      setIsOpen(true);
      updateNodeData(id, { autoOpen: false });
    }
  }, [data?.autoOpen, data?.configured, id, updateNodeData]);

  const handleSave = () => {
    if (!webhookName.trim()) {
      toast.warning("Please enter webhook name");
      return;
    }
    updateNodeData(id, {
      webhookName: webhookName.trim(),
      webhookUrl,
      configured: true
    });
    setIsOpen(false);
  };

  const copyUrl = () => {
    if (!isUrlReady) {
      toast.info("Please save workflow first");
      return;
    }
    navigator.clipboard.writeText(webhookUrl);
    toast.success("Webhook URL copied to clipboard");
  };

  return (
    <div className="rounded-xl border border-teal-500/50 hover:border-teal-400 bg-teal-900/40 backdrop-blur-md transition-all duration-300 shadow-lg min-w-[150px] relative group">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Settings className="absolute opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity w-4 h-4 -top-2 bg-[#1e1e1e] text-white border border-white/20 rounded-full right-0 cursor-pointer p-0.5 z-10" />
        </DialogTrigger>
        <DialogContent className="max-w-md bg-[#0A0A0A] border-white/10 text-white">
          <DialogTitle className="text-white">Configure Webhook Trigger</DialogTitle>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Webhook Name
              </label>
              <Input
                value={webhookName}
                onChange={(e) => setWebhookName(e.target.value)}
                placeholder="Enter webhook name"
                className="bg-white/5 border-white/10 text-white focus:border-teal-500/50 focus:ring-teal-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Webhook URL</label>
              <div className="flex gap-2">
                <Input
                  value={webhookUrl}
                  readOnly
                  className={`border-white/10 text-white ${isUrlReady ? "bg-teal-500/10 text-teal-300 border-teal-500/30" : "bg-white/5 opacity-70"}`}
                />
                <Button size="sm" onClick={copyUrl} disabled={!isUrlReady} className="bg-teal-600 hover:bg-teal-700 text-white border border-teal-500/30">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              {!isUrlReady && (
                <p className="text-yellow-400 text-xs mt-2 bg-yellow-400/10 border border-yellow-400/20 p-2 rounded">
                  ⚠️ Save workflow first to generate URL
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700 text-white">Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Trash
        className="absolute w-4 h-4 -top-2 bg-[#1e1e1e] text-red-400 border border-red-500/30 rounded-full right-5 cursor-pointer p-0.5 z-10 hover:bg-red-900/50 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => deleteNode(id)}
      />

      <div className="p-4 flex flex-col items-center justify-center gap-2 text-center">
        <div className={`p-2 rounded-lg bg-black/20 backdrop-blur-sm border border-white/5 ${data?.configured ? 'text-teal-400' : 'text-gray-400'}`}>
          <Webhook className="w-6 h-6" />
        </div>
        <div className="text-white text-sm font-medium max-w-[120px] truncate" title={data?.webhookName || "Webhook"}>
          {data?.webhookName || "Webhook"}
        </div>
        <div className="text-[10px] mt-1 font-medium transition-colors">
          {data?.configured ? (
            <span className="text-teal-400 flex items-center justify-center gap-1">
              ✓ Configured
            </span>
          ) : (
            <span className="text-yellow-400 flex items-center justify-center gap-1">
              ! Needs Setup
            </span>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-teal-500 border-2 border-white"
      />
    </div>
  );
}
