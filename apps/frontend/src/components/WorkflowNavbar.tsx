/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Save, Loader2, Play, Upload, Download, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "./ui/dialog";
import { WorkflowImportDialog } from "./WorkflowImportDialog";
import { WorkflowExportDialog } from "./WorkflowExportDialog";
import { ActionForm, availableActions, type ActionI } from "@/lib/Actions";
import { useWorkflowStore } from "@/store/workflowStore";

interface WorkflowNavbarProps {
  projectName?: string;
  isActive?: boolean;
  onSave?: () => void;
  onActiveToggle?: (active: boolean) => void;
  onNameChange?: (newName: string) => void;
  isSaving?: boolean;
  isViewMode?: boolean;
  getViewportCenter?: () => { x: number; y: number };
}

export function WorkflowNavbar({
  projectName = "My Project Name",
  isActive = false,
  onSave,
  onActiveToggle,
  onNameChange,
  isSaving = false,
  isViewMode = false,
  getViewportCenter,
}: WorkflowNavbarProps) {
  const navigate = useNavigate();
  const [dialogState, setDialogState] = useState("actions");
  const [selectedAction, setSelectedAction] = useState<ActionI | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(projectName);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    executeWorkflowWithWebSocket,
    isExecuting,
    disconnectWebSocket,

  } = useWorkflowStore();

  const addActionNode = useWorkflowStore((state) => state.addActionNode);

  const handleActionSelect = (action: ActionI) => {
    setSelectedAction(action);
    setDialogState("form");
  };

  const handleBackToActions = () => {
    setDialogState("actions");
    setSelectedAction(null);
  };

  const handleFormSubmit = (data: {
    action: ActionI;
    formData: any;
    credentials: any;
    metadata: any;
  }) => {
    console.log("Form submitted:", data);

    const position = getViewportCenter?.();
    addActionNode({
      name: data.action.name,
      type: data.action.type,
      application: data.action.application,
      parameters: data.formData,
      credentials: data.credentials,
      metadata: data.metadata,
      actionDefinition: data.action,
    }, position);

    setDialogState("actions");
    setSelectedAction(null);
    setIsDialogOpen(false);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setDialogState("actions");
      setSelectedAction(null);
    }
  };

  const handleExecution = async () => {
    try {
      await executeWorkflowWithWebSocket();
    } catch (err) {
      console.log("Error is execution", err);
    }
  };

  const handleNameClick = () => {
    setIsEditingName(true);
    setEditedName(projectName);
  };

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (editedName.trim() && editedName !== projectName) {
      onNameChange?.(editedName.trim());
    } else {
      setEditedName(projectName);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      setEditedName(projectName);
      setIsEditingName(false);
    }
  };

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  useEffect(() => {
    setEditedName(projectName);
  }, [projectName]);

  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, [disconnectWebSocket]);

  return (
    <nav className="w-full flex items-center justify-between py-4 px-6 mt-0 border-b border-white/10 bg-black/40 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard")}
          className="mr-2 text-white/50 hover:text-white hover:bg-white/10 h-8 w-8 rounded-full"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="h-5 w-[4px] rounded-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]"></div>
        {isEditingName ? (
          <input
            ref={inputRef}
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            className="text-xl font-semibold text-white bg-transparent border-b-2 border-teal-500 focus:outline-none px-1 min-w-[200px]"
          />
        ) : (
          <h2
            className="text-xl font-semibold text-white hover:text-teal-400 transition-colors cursor-pointer"
            onClick={handleNameClick}
          >
            {projectName}
          </h2>
        )}
        {isViewMode && (
          <span className="px-2 py-0.5 text-xs bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full font-medium ml-2">
            Saved
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-300 hidden sm:inline">
            Active
          </span>
          <Switch
            checked={isActive}
            onCheckedChange={onActiveToggle}
            className="data-[state=checked]:bg-teal-500 border-white/20"
          />
          <span className="text-xs text-gray-400 sm:hidden">
            {isActive ? "On" : "Off"}
          </span>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button className="bg-white/10 text-white cursor-pointer border border-white/10 hover:bg-white/20 transition-all backdrop-blur-sm">
              Add Action
            </Button>
          </DialogTrigger>

          <DialogContent className="bg-[#0A0A0A] border-white/10 text-white sm:max-w-[600px]">
            {dialogState === "actions" && (
              <div className="flex flex-col max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
                <DialogTitle className="font-semibold text-teal-400 text-lg mb-4">
                  Select an Action
                </DialogTitle>
                <div className="grid gap-2">
                  {availableActions.map((action) => {
                    return (
                      <div
                        key={action.id}
                        onClick={() => handleActionSelect(action)}
                        className="flex cursor-pointer bg-white/5 items-center gap-3 p-3 border border-white/5 rounded-lg hover:bg-white/10 hover:border-teal-500/50 transition-all group"
                      >
                        <span className="text-xl group-hover:scale-110 transition-transform">{action.icon}</span>
                        <div className="font-medium text-white">{action.name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {dialogState === "form" && selectedAction && (
              <ActionForm
                action={selectedAction}
                onBack={handleBackToActions}
                onSubmit={handleFormSubmit}
              />
            )}
          </DialogContent>
        </Dialog>

        <Button
          onClick={() => setIsImportDialogOpen(true)}
          className="bg-white/10 text-white cursor-pointer border border-white/10 hover:bg-white/20 transition-all backdrop-blur-sm flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Import
        </Button>

        <Button
          onClick={() => setIsExportDialogOpen(true)}
          className="bg-white/10 text-white cursor-pointer border border-white/10 hover:bg-white/20 transition-all backdrop-blur-sm flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export
        </Button>

        <Button
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-2 flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleExecution}
          disabled={isExecuting}
        >
          {isExecuting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              Run
            </>
          )}
        </Button>

        <Button
          onClick={onSave}
          disabled={isSaving}
          className="bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-4 py-2 flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(13,148,136,0.3)] hover:shadow-[0_0_25px_rgba(13,148,136,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {isSaving
              ? isViewMode
                ? "Updating..."
                : "Saving..."
              : isViewMode
                ? "Update"
                : "Save"}
          </span>
        </Button>
        <WorkflowImportDialog
          open={isImportDialogOpen}
          onOpenChange={setIsImportDialogOpen}
        />

        <WorkflowExportDialog
          open={isExportDialogOpen}
          onOpenChange={setIsExportDialogOpen}
        />
      </div>
    </nav>
  );
}
