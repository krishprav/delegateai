/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Database,
  Mail,
  MessageSquare,
  Send,
  Webhook,
  Clock,
  Filter,
  Code,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { actionSchemas } from "./constant";
import { useWorkflowStore } from "@/store/workflowStore";

export interface ActionI {
  id: string;
  name: string;
  type: string;
  application?: string;
  description?: string;
  icon?: React.ReactNode;
  category?: string;
}

// eslint-disable-next-line react-refresh/only-export-components
export const availableActions: ActionI[] = [
  {
    id: "telegram-message",
    name: "Telegram",
    type: "TelegramNodeType",
    application: "Telegram",
    description: "Send a message to a Telegram chat",
    icon: <MessageSquare className="w-5 h-5" />,
    category: "Communication",
  },
  {
    id: "slack-message",
    name: "Slack",
    type: "SlackNodeType",
    application: "Slack",
    description: "Send a message to a Slack channel or user",
    icon: <MessageSquare className="w-5 h-5" />,
    category: "Communication",
  },
  {
    id: "discord-message",
    name: "Discord",
    type: "DiscordNodeType",
    application: "Discord",
    description: "Send a message to a Discord channel or user",
    icon: <MessageSquare className="w-5 h-5" />,
    category: "Communication",
  },
  {
    id: "email-trigger",
    name: "GmailTrigger",
    type: "GmailTrigger",
    application: "google",
    description: "When a mail hits your Inbox",
    icon: <Mail className="w-5 h-5" />,
    category: "Communication",
  },
  {
    id: "resend-email",
    name: "Resend",
    type: "ResendNodeType",
    application: "Resend",
    description: "Send transactional emails via Resend API with high deliverability",
    icon: <Send className="w-5 h-5" />,
    category: "Communication",
  },
  {
    id: "open-ai",
    name: "OpenAi",
    type: "openAiNodeType",
    application: "OpenAi",
    description: "Execute a llm call",
    icon: <Database className="w-5 h-5" />,
    category: "Data",
  },
  {
    id: "open-router",
    name: "OpenRouter",
    type: "openRouterNodeType",
    application: "OpenRouter",
    description: "Execute LLM calls with multiple AI models",
    icon: <Database className="w-5 h-5" />,
    category: "Data",
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    type: "GoogleSheetsNodeType",
    application: "google",
    description: "Read from or write to Google Sheets",
    icon: <Database className="w-5 h-5" />,
    category: "Data",
  },
  {
    id: "aws-s3",
    name: "AWS S3",
    type: "AwsS3NodeType",
    application: "aws",
    description: "Upload or read files from AWS S3",
    icon: <Database className="w-5 h-5" />,
    category: "Storage",
  },
  {
    id: "webhook-call",
    name: "Call Webhook",
    type: "WebHookNodeType",
    description: "Make an HTTP request to an external API",
    icon: <Webhook className="w-5 h-5" />,
    category: "Integration",
  },
  {
    id: "delay",
    name: "Delay",
    type: "DelayNodeType",
    description: "Wait for a specified amount of time",
    icon: <Clock className="w-5 h-5" />,
    category: "Utility",
  },
  {
    id: "filter",
    name: "Filter",
    type: "FilterNodeType",
    description: "Filter data based on conditions",
    icon: <Filter className="w-5 h-5" />,
    category: "Logic",
  },
  {
    id: "code",
    name: "Code",
    type: "CodeNodeType",
    description: "Execute custom JavaScript code",
    icon: <Code className="w-5 h-5" />,
    category: "Developer",
  },

];

export const ActionForm = ({
  action,
  onBack,
  onSubmit,
}: {
  action: ActionI;
  onBack: () => void;
  onSubmit: (data: any) => any;
}) => {
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const currInd = action.application ?? action.type ?? action.name;
  const schema = actionSchemas[currInd] || { fields: [] };

  const handleInputChange = (fieldName: any, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // Handle toggle changes and auto-populate target field
  const handleToggleChange = (toggleField: any, isEnabled: boolean) => {
    const newFormData = {
      ...formData,
      [toggleField.name]: isEnabled,
    };

    // If toggle is enabled and has auto-populate config, fill the target field
    if (isEnabled && toggleField.autoPopulateField && toggleField.autoPopulateTemplate) {
      newFormData[toggleField.autoPopulateField] = toggleField.autoPopulateTemplate;
    }

    setFormData(newFormData);
  };

  const userCredentials = useWorkflowStore((state) => state.userCredentials);

  const getCredentialsForApplication = (applicationName: string) => {
    if (!applicationName) return null;

    const credentials = userCredentials.find(
      (cred) =>
        cred.application?.toLowerCase() === applicationName.toLowerCase()
    );

    return credentials || null;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const applicationCredentials = action.application
        ? getCredentialsForApplication(action.application)
        : null;

      const submitData = {
        action,
        formData,
        credentials: applicationCredentials,
        metadata: {
          applicationName: action.application,
          actionType: action.type,
          timestamp: new Date().toISOString(),
        },
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error("Error submitting action form:", error);
      toast.error("Error submitting action form");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasRequiredCredentials =
    !action.application ||
    getCredentialsForApplication(action.application) !== null;

  return (
    <div className="flex flex-col max-h-[50vh]">
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2 hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <DialogTitle className="font-semibold text-teal-600 text-lg">
          Configure {action.name}
        </DialogTitle>
      </div>

      {action.application && !hasRequiredCredentials && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-start">
            <div className="shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Credentials Required
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                No credentials found for {action.application}. Please add your{" "}
                {action.application} credentials before using this action.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Info */}
      {action.application && hasRequiredCredentials && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-green-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="ml-2 text-sm text-green-700">
              {action.application} credentials are configured and ready to use.
            </p>
          </div>
        </div>
      )}

      {/* Resend-specific help */}
      {action.type === "ResendNodeType" && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-md">
          <div className="text-sm">
            <div className="font-semibold text-purple-900 mb-2">Resend Tips:</div>
            <ul className="list-disc ml-4 space-y-1 text-purple-800">
              <li>Use dynamic values like <code className="bg-purple-100 px-1 rounded">{"{{previousNode.output}}"}</code></li>
              <li>From address must be from a verified domain</li>
              <li>Supports HTML and plain text emails</li>
              <li>Use comma-separated emails for multiple recipients</li>
            </ul>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto group scrollbar-hide">
        {schema.fields.map((field: any) => (
          <div key={field.name} className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {field.type === "text" && (
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={formData[field.name] || ""}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                required={field.required}
                placeholder={field.placeholder}
              />
            )}

            {field.type === "password" && (
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={formData[field.name] || ""}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                required={field.required}
                placeholder={field.placeholder}
              />
            )}

            {field.type === "textarea" && (
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows={3}
                value={formData[field.name] || ""}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                required={field.required}
                placeholder={field.placeholder}
              />
            )}

            {field.type === "select" && (
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={formData[field.name] || ""}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                required={field.required}
              >
                <option value="">Select {field.label}</option>
                {field.options?.map((option: any) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}

            {field.type === "number" && (
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={formData[field.name] || ""}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                required={field.required}
                min={field.min}
                max={field.max}
                step={field.step}
                placeholder={field.placeholder}
              />
            )}

            {field.type === "toggle" && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <Switch
                  checked={formData[field.name] || field.defaultValue || false}
                  onCheckedChange={(checked) => handleToggleChange(field, checked)}
                  className="data-[state=checked]:bg-teal-500"
                />
                <div className="flex-1">
                  <p className="text-sm text-blue-800">
                    {formData[field.name]
                      ? `Using: ${field.autoPopulateTemplate}`
                      : "Use manual input"}
                  </p>
                </div>
              </div>
            )}

            {field.description && (
              <p className="text-xs text-gray-500 mt-1">{field.description}</p>
            )}
          </div>
        ))}

        {/* Form Actions */}
        <div className="flex gap-3 pt-4 border-t group">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="flex-1 text-white/30 hover:text-white hover:bg-white/10 transition-all duration-300"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-teal-500 hover:bg-teal-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || !hasRequiredCredentials}
          >
            {isSubmitting ? "Adding..." : "Add Action"}
          </Button>
        </div>
      </form>
    </div>
  );
};
