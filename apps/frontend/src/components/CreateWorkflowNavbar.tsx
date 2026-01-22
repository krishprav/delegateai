/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Save, Loader2, Upload, Download, ArrowLeft } from "lucide-react";
import { WorkflowImportDialog } from "./WorkflowImportDialog";
import { WorkflowExportDialog } from "./WorkflowExportDialog";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "./ui/dialog";
import { ActionForm, availableActions, type ActionI } from "@/lib/Actions";
import { useWorkflowStore } from "@/store/workflowStore";

interface CreateWorkflowNavbarProps {
  projectName?: string;
  isActive?: boolean;
  onSave?: () => void;
  onActiveToggle?: (active: boolean) => void;
  onNameChange?: (newName: string) => void;
  isSaving?: boolean;
  getViewportCenter?: () => { x: number; y: number };
}

export function CreateWorkflowNavbar({
  projectName = "New Workflow",
  isActive = false,
  onSave,
  onActiveToggle,
  onNameChange,
  isSaving = false,
  getViewportCenter,
}: CreateWorkflowNavbarProps) {
  const navigate = useNavigate();
  const [dialogState, setDialogState] = useState("actions");
  const [selectedAction, setSelectedAction] = useState<ActionI | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [dialogName, setDialogName] = useState(projectName);
  const [dialogDescription, setDialogDescription] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(projectName);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get addActionNode from store
  const addActionNode = useWorkflowStore((state) => state.addActionNode);
  const projectDescription = useWorkflowStore((state) => state.projectDescription);
  const setProjectDescription = useWorkflowStore((state) => state.setProjectDescription);

  // Sync dialog states when opening
  useEffect(() => {
    if (isConfirmDialogOpen) {
      setDialogName(projectName);
      setDialogDescription(projectDescription);
    }
  }, [isConfirmDialogOpen, projectName, projectDescription]);

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

        <div className="flex items-center gap-2">
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

          <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
            <DialogTrigger asChild>
              <Button
                disabled={isSaving}
                className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(13,148,136,0.3)] hover:shadow-[0_0_25px_rgba(13,148,136,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {isSaving ? "Creating..." : "Create Workflow"}
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-[#0A0A0A] border-white/10 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">Confirm Workflow Creation</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Review and edit your workflow details before creating it.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="workflow-name" className="text-sm font-medium text-gray-300">
                    Workflow Name <span className="text-teal-500">*</span>
                  </label>
                  <Input
                    id="workflow-name"
                    value={dialogName}
                    onChange={(e) => setDialogName(e.target.value)}
                    placeholder="Enter workflow name"
                    className="w-full bg-white/5 border-white/10 text-white focus:border-teal-500/50 focus:ring-teal-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="workflow-description" className="text-sm font-medium text-gray-300">
                    Description (Optional)
                  </label>
                  <textarea
                    id="workflow-description"
                    value={dialogDescription}
                    onChange={(e) => setDialogDescription(e.target.value)}
                    placeholder="Describe what this workflow does..."
                    className="w-full min-h-[100px] px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent resize-none text-white placeholder-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-300">Status:</div>
                  <div className="text-base">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive ? "bg-teal-500/20 text-teal-300 border border-teal-500/30" : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                      }`}>
                      {isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-300">Nodes:</div>
                  <div className="text-base text-gray-200">{useWorkflowStore.getState().nodes.length} node(s)</div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" className="border-white/10 text-white hover:bg-white/10 hover:text-white bg-transparent">Cancel</Button>
                </DialogClose>
                <Button
                  onClick={() => {
                    if (dialogName.trim()) {
                      onNameChange?.(dialogName.trim());
                      setProjectDescription(dialogDescription.trim());
                      setIsConfirmDialogOpen(false);
                      onSave?.();
                    }
                  }}
                  disabled={isSaving || !dialogName.trim()}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Confirm & Create"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <WorkflowImportDialog
            open={isImportDialogOpen}
            onOpenChange={setIsImportDialogOpen}
          />

          <WorkflowExportDialog
            open={isExportDialogOpen}
            onOpenChange={setIsExportDialogOpen}
          />
        </div>
      </div>
    </nav>
  );
}
