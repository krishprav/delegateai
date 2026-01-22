import { Handle, Position } from "@xyflow/react";
import { Settings, Trash, Mail, Database, Webhook, Send, FileText, Grid, Trello } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useState } from "react";
import { useWorkflowStore } from "@/store/workflowStore";
import DynamicActionForm from "../DynamicActionForm";

const getActionIcon = (actionType: string) => {
  switch (actionType) {
    case "TelegramNodeType":
      return <Send className="w-6 h-6 text-cyan-400" />;
    case "GmailTrigger":
      return <Mail className="w-6 h-6 text-red-400" />;
    case "ResendNodeType":
      return <Send className="w-6 h-6 text-orange-400" />;
    case "openAiNodeType":
      return <Database className="w-6 h-6 text-green-400" />;
    case "openRouterNodeType":
      return <Database className="w-6 h-6 text-blue-400" />;
    case "WebHookNodeType":
      return <Webhook className="w-6 h-6 text-purple-400" />;
    case "EmailNodeType":
      return <Mail className="w-6 h-6 text-orange-400" />;
    case "GoogleSheetsNodeType":
      return <Grid className="w-6 h-6 text-green-500" />;
    case "createTrelloCard":
      return <Trello className="w-6 h-6 text-blue-500" />;
    case "downloadFile":
      return <FileText className="w-6 h-6 text-yellow-400" />;
    case "analyzeData":
      return <Database className="w-6 h-6 text-purple-400" />;
    default:
      return <Settings className="w-6 h-6 text-gray-400" />;
  }
};

const getActionDisplayName = (actionType: string) => {
  switch (actionType) {
    case "TelegramNodeType":
      return "Telegram";
    case "GmailTrigger":
      return "Gmail";
    case "ResendNodeType":
      return "Resend";
    case "openAiNodeType":
      return "OpenAI";
    case "openRouterNodeType":
      return "OpenRouter";
    case "WebHookNodeType":
      return "Webhook";
    case "EmailNodeType":
      return "Email";
    case "GoogleSheetsNodeType":
      return "Google Sheets";
    case "createTrelloCard":
      return "Trello";
    case "downloadFile":
      return "Download File";
    case "analyzeData":
      return "AI Analyze";
    default:
      return actionType || "Action";
  }
};

// Helper to get premium styles based on node type
const getNodeStyles = (type: string) => {
  switch (type) {
    case 'SlackNodeType':
    case 'slack':
      return {
        glow: 'from-purple-500 to-indigo-500',
        bg: 'from-purple-500/20 to-indigo-500/20',
        border: 'border-purple-500/30',
        icon: 'text-purple-400',
        handle: '!bg-purple-500',
        text: 'text-purple-200/50'
      };
    case 'createTrelloCard':
    case 'trello':
      return {
        glow: 'from-blue-500 to-cyan-500',
        bg: 'from-blue-500/20 to-cyan-500/20',
        border: 'border-blue-500/30',
        icon: 'text-blue-400',
        handle: '!bg-blue-500',
        text: 'text-blue-200/50'
      };
    case 'openAiNodeType':
    case 'openai':
    case 'analyzeData':
      return {
        glow: 'from-emerald-500 to-teal-500',
        bg: 'from-emerald-500/20 to-teal-500/20',
        border: 'border-emerald-500/30',
        icon: 'text-emerald-400',
        handle: '!bg-emerald-500',
        text: 'text-emerald-200/50'
      };
    case 'GmailTrigger':
    case 'ResendNodeType':
    case 'EmailNodeType':
    case 'sendEmail':
      return {
        glow: 'from-red-500 to-orange-500',
        bg: 'from-red-500/20 to-orange-500/20',
        border: 'border-red-500/30',
        icon: 'text-red-400',
        handle: '!bg-red-500',
        text: 'text-red-200/50'
      };
    case 'GoogleSheetsNodeType':
    case 'saveToGoogleSheets':
    case 'downloadFile':
      return {
        glow: 'from-green-500 to-lime-500',
        bg: 'from-green-500/20 to-lime-500/20',
        border: 'border-green-500/30',
        icon: 'text-green-400',
        handle: '!bg-green-500',
        text: 'text-green-200/50'
      };
    default:
      return {
        glow: 'from-violet-500 to-fuchsia-500',
        bg: 'from-violet-500/20 to-fuchsia-500/20',
        border: 'border-violet-500/30',
        icon: 'text-violet-400',
        handle: '!bg-violet-500',
        text: 'text-violet-200/50'
      };
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ActionNode({ data, id }: { data: any; id: string }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const deleteNode = useWorkflowStore((state) => state.deleteNode);
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

  const actionType = data.actionType || data.type;
  const styles = getNodeStyles(actionType);
  const actionIcon = getActionIcon(actionType);
  const displayName = data.label || getActionDisplayName(actionType);

  const handleDelete = () => {
    deleteNode(id);
    setIsDialogOpen(false);
  };

  const handleUpdate = (values: any) => {
    updateNodeData(id, { parameters: values });
    setIsDialogOpen(false);
  };

  return (
    <div className="relative group min-w-[220px]">
      {/* Settings Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {/* ... dialog content ... */}
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto scrollbar-hide bg-[#141414] border-white/10 text-white shadow-2xl">
          <DialogTitle className="text-xl font-bold text-white">Action Configuration</DialogTitle>
          <div className="space-y-6 mt-4">
            <div className="flex items-center gap-4 border-b border-white/10 pb-6">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${styles.bg} ${styles.border} border`}>
                <div className={styles.icon}>{actionIcon}</div>
              </div>
              <div>
                <h3 className="font-bold text-xl text-white">{displayName}</h3>
                <p className="text-sm text-gray-400 font-medium">{data.application}</p>
              </div>
            </div>

            {/* cred info */}
            {data.credentials && (
              <div className="bg-green-500/5 border border-green-500/20 p-4 rounded-xl flex items-start gap-3">
                <div className="mt-0.5 text-green-400">✓</div>
                <div>
                  <h4 className="font-semibold text-green-400">Credentials Configured</h4>
                  <p className="text-sm text-green-200/60 mt-1">
                    Using <span className="font-medium text-green-200">{data.credentials.name}</span> for {data.credentials.application}
                  </p>
                </div>
              </div>
            )}

            {!data.credentials && data.application && (
              <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
                <div className="mt-0.5 text-amber-400">⚠</div>
                <div>
                  <h4 className="font-semibold text-amber-400">Missing Credentials</h4>
                  <p className="text-sm text-amber-200/60 mt-1">
                    Please configure credentials for {data.application} to run this action.
                  </p>
                </div>
              </div>
            )}

            {/* Dynamic Form */}
            <div className="bg-[#1c1c1c] border border-white/5 p-5 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-4 h-4 text-teal-400" />
                <h4 className="font-semibold text-white">Parameters</h4>
              </div>
              <DynamicActionForm
                actionType={actionType}
                initialValues={data.parameters || {}}
                onSubmit={handleUpdate}
                onCancel={() => setIsDialogOpen(false)}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-6 border-t border-white/10 mt-2">
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="ml-auto bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-all"
            >
              Delete Node
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Glow effect */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${styles.glow} rounded-2xl blur opacity-20 group-hover:opacity-50 transition duration-500`}></div>

      {/* Main Card Content */}
      <div className="relative bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transition-all duration-300">

        {/* Node Controls (visible on hover) */}
        <div className="absolute -top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0 z-20">
          <Settings
            className="w-7 h-7 bg-[#252525] text-gray-300 hover:text-white border border-white/10 hover:border-white/30 rounded-full cursor-pointer p-1.5 shadow-xl transition-colors"
            onClick={() => setIsDialogOpen(true)}
          />
          <Trash
            className="w-7 h-7 bg-[#252525] text-red-400/80 hover:text-red-400 border border-white/10 hover:border-red-500/50 rounded-full cursor-pointer p-1.5 shadow-xl transition-colors"
            onClick={handleDelete}
          />
        </div>

        <Handle
          type="target"
          position={Position.Left}
          className={`${styles.handle} !w-3 !h-3 !border-4 !border-[#0A0A0A]`}
        />

        {/* Node Content */}
        <div className="p-4 relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            {/* Icon Box */}
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border border-white/5 shadow-sm bg-gradient-to-br ${styles.bg} ${styles.border}`}>
              <div className={`transform transition-transform group-hover:scale-110 duration-300 ${styles.icon}`}>
                {actionIcon}
              </div>
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-white font-bold text-sm truncate leading-tight">
                {displayName}
              </span>
              <span className={`text-[10px] font-medium truncate uppercase tracking-wider mt-1 ${styles.text}`}>
                {data.application || actionType}
              </span>

              {/* Mini Status Dot */}
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${data.credentials ? 'bg-green-500' : 'bg-amber-500'}`} />
                <span className={`text-[9px] font-medium ${data.credentials ? 'text-green-500' : 'text-amber-500'}`}>
                  {data.credentials ? 'Ready' : 'Setup'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Handle
          type="source"
          position={Position.Right}
          className={`${styles.handle} !w-3 !h-3 !border-4 !border-[#0A0A0A]`}
        />
      </div>
    </div>
  );
}
