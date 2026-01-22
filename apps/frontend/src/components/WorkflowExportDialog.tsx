import { useState } from "react";
import { Download, Copy, Check, FileJson, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useWorkflowStore } from "@/store/workflowStore";

interface WorkflowExportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const WorkflowExportDialog = ({
    open,
    onOpenChange,
}: WorkflowExportDialogProps) => {
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { exportWorkflow, projectName } = useWorkflowStore();

    const workflowJson = exportWorkflow();

    const handleCopy = () => {
        try {
            navigator.clipboard.writeText(workflowJson);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            setError("Failed to copy to clipboard");
        }
    };

    const handleDownload = () => {
        try {
            const blob = new Blob([workflowJson], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${projectName.toLowerCase().replace(/\s+/g, "-")}-workflow.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            onOpenChange(false);
        } catch (error) {
            setError("Failed to download file");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl bg-[#020202] text-white border-gray-800">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-white">
                        <FileJson className="h-5 w-5" />
                        Export Workflow
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-gray-400">
                            <span>Workflow JSON</span>
                            <span className="text-xs text-gray-500">
                                {workflowJson.length} characters
                            </span>
                        </div>

                        <Textarea
                            value={workflowJson}
                            readOnly
                            className="font-mono text-xs h-64 bg-gray-900 border-gray-700 text-gray-300 resize-none"
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                    <DialogClose asChild>
                        <Button variant="ghost">Cancel</Button>
                    </DialogClose>

                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            onClick={handleCopy}
                            className="text-gray-400 hover:text-white"
                        >
                            {copied ? (
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    Copied!
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Copy className="h-4 w-4" />
                                    Copy to Clipboard
                                </div>
                            )}
                        </Button>

                        <Button
                            onClick={handleDownload}
                            className="bg-blue-600 hover:bg-blue-500"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download JSON
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
