import { useState, useRef } from "react";
import { Upload, X, FileJson, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useWorkflowStore } from "@/store/workflowStore";

interface WorkflowImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WorkflowImportDialog = ({
  open,
  onOpenChange,
}: WorkflowImportDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { importWorkflow } = useWorkflowStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".json")) {
        setError("Please select a valid JSON file");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const jsonString = e.target?.result as string;
          const result = await importWorkflow(jsonString);
          
          if (result.success) {
            onOpenChange(false);
            setFile(null);
          } else {
            setError(result.error || "Failed to import workflow");
          }
        } catch (error) {
          setError("Failed to read file");
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      setError("Failed to import workflow");
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (!droppedFile.name.endsWith(".json")) {
        setError("Please select a valid JSON file");
        return;
      }
      setFile(droppedFile);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#020202] text-white border-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <FileJson className="h-5 w-5" />
            Import Workflow
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer bg-gray-900/50 hover:bg-gray-800/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".json"
              onChange={handleFileChange}
            />
            
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileJson className="h-8 w-8 text-green-500" />
                <div className="text-sm text-gray-300">
                  {file.name}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setError(null);
                  }}
                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <Upload className="h-8 w-8" />
                <div className="text-sm">
                  Drag and drop your JSON file here
                </div>
                <div className="text-xs text-gray-500">
                  or click to browse
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {file && !error && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <FileJson className="h-4 w-4" />
                <span>File ready to import: {file.name}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <DialogClose asChild>
            <Button
              variant="ghost"
              onClick={() => {
                setFile(null);
                setError(null);
              }}
            >
              Cancel
            </Button>
          </DialogClose>
          
          <Button
            onClick={handleImport}
            disabled={!file || isLoading}
            className="bg-blue-600 hover:bg-blue-500"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Importing...
              </div>
            ) : (
              "Import Workflow"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
