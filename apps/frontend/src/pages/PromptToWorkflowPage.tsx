import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send,
  ChevronDown,
  LayoutTemplate,
  Bot,
  MessageSquare,
  Zap,
  Paperclip,
  SlidersHorizontal,
  ArrowLeft,
  Mic
} from "lucide-react";
import axios from "axios";
import { BACKEND_URL } from "@/config/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AuroraBackground } from "@/components/AuroraBackground";

// Types
interface Template {
  id: string;
  name: string;
  description: string;
  prompt: string;
}

const templates: Template[] = [
  {
    id: "email-automation",
    name: "Email Automation",
    description: "Automate email sending & filtering",
    prompt: "Monitor my inbox for invoices, extract the amount and due date, and add them to a Google Sheet.",
  },
  {
    id: "social-media",
    name: "Social Media",
    description: "Schedule and manage social media posts",
    prompt: "Post a motivational quote to Twitter every morning at 8 AM.",
  },
  {
    id: "data-analysis",
    name: "Data Analysis",
    description: "Process and analyze data sets",
    prompt: "Download CSV from Google Drive, filter for high-value customers, and send a report.",
  },
  {
    id: "task-management",
    name: "Task Management",
    description: "Automate task creation and tracking",
    prompt: "Create a Trello card for every new GitHub issue labeled 'bug'.",
  },
];

type Mode = 'agent' | 'plan' | 'ask';

export default function PromptToWorkflowPage() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<Mode>('agent');
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [promptHistory, setPromptHistory] = useState<string[]>([]);

  // Refs for UI interactions
  const dropdownRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
    }
  }, [prompt]);

  const handleTemplateChange = (value: string) => {
    const template = templates.find(t => t.id === value);
    if (template) {
      setPrompt(template.prompt);
      setSelectedTemplate(value);
    } else {
      setSelectedTemplate("");
    }
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsLoading(true);

    try {
      // Add prompt to history (without duplicates)
      if (!promptHistory.includes(prompt.trim())) {
        setPromptHistory(prev => [prompt.trim(), ...prev].slice(0, 10)); // Keep last 10
      }

      // API call to generate workflow
      const response = await axios.post(`${BACKEND_URL}/api/v1/workflow/generate`, {
        prompt: prompt.trim(),
        template: selectedTemplate,
      }, {
        withCredentials: true,
      });

      if (response.data.success) {
        // Navigate to the created workflow
        navigate(`/workflow/${response.data.data.workflowId}`);
      } else {
        toast.error(response.data.message || "Failed to generate workflow");
      }
    } catch (error) {
      console.error("Error generating workflow:", error);
      toast.error("Failed to generate workflow. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <AuroraBackground>
      <div className="relative w-full max-w-4xl mx-auto flex flex-col gap-8 px-6 py-12">

        {/* Header */}
        <div className="relative z-10 space-y-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="group flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Create Workflow from Prompt
            </h1>
            <p className="text-lg text-white/60 max-w-2xl">
              Describe what you want to automate in plain English. We'll create a workflow for you.
            </p>
          </div>
        </div>

        {/* Main Input Area */}
        <div className="relative z-10">
          <TooltipProvider>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]">

              {/* Input Controls */}
              <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  {/* Mode Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all outline-none border border-transparent hover:border-white/5 focus:bg-white/5 group/btn"
                    >
                      <div className={cn(
                        "p-1 rounded-md bg-white/5 border border-white/5",
                        selectedMode === 'agent' && "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                        selectedMode === 'plan' && "text-blue-400 bg-blue-500/10 border-blue-500/20",
                        selectedMode === 'ask' && "text-purple-400 bg-purple-500/10 border-purple-500/20",
                      )}>
                        {selectedMode === 'agent' && <Bot className="w-3.5 h-3.5" />}
                        {selectedMode === 'plan' && <LayoutTemplate className="w-3.5 h-3.5" />}
                        {selectedMode === 'ask' && <MessageSquare className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-sm font-medium capitalize tracking-wide">{selectedMode}</span>
                      <ChevronDown className={cn("w-3 h-3 opacity-50 transition-transform duration-300", isModeDropdownOpen && "rotate-180")} />
                    </button>

                    {/* Mode Menu */}
                    {isModeDropdownOpen && (
                      <div className="absolute top-[calc(100%+8px)] left-0 min-w-[200px] p-1.5 bg-[#0A0A0A]/95 backdrop-blur-3xl border border-white/10 rounded-xl shadow-[0_20px_40px_-12px_rgba(0,0,0,1),0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-left z-50">
                        <div className="flex flex-col gap-0.5">
                          {[
                            { id: 'agent', label: 'Agent', desc: 'Execute autonomous tasks', icon: Bot, color: 'text-emerald-400' },
                            { id: 'plan', label: 'Plan', desc: 'Create implementation plans', icon: LayoutTemplate, color: 'text-blue-400' },
                            { id: 'ask', label: 'Ask', desc: 'Chat about your codebase', icon: MessageSquare, color: 'text-purple-400' }
                          ].map((mode) => (
                            <button
                              key={mode.id}
                              onClick={() => {
                                setSelectedMode(mode.id as Mode);
                                setIsModeDropdownOpen(false);
                              }}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left group/option",
                                selectedMode === mode.id ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
                              )}
                            >
                              <mode.icon className={cn("w-4 h-4", mode.color)} />
                              <div>
                                <div className="font-medium">{mode.label}</div>
                                <div className="text-[10px] text-white/30 group-hover/option:text-white/50">{mode.desc}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="w-[1px] h-4 bg-white/10" />

                  {/* Templates Select */}
                  <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                    <SelectTrigger
                      className={cn(
                        "h-8 border-none bg-transparent text-white/50 hover:text-white px-2 focus:ring-0 focus:ring-offset-0 gap-2 data-[placeholder]:text-white/50",
                        "flex items-center text-xs font-medium outline-none transition-colors"
                      )}
                    >
                      <SelectValue placeholder="Load a template..." />
                    </SelectTrigger>
                    <SelectContent
                      className="bg-[#0A0A0A]/95 border-white/10 text-white backdrop-blur-3xl rounded-xl shadow-2xl min-w-[300px]"
                    >
                      <SelectItem value="none" className="text-white/50 hover:text-white focus:bg-white/10 focus:text-white cursor-pointer text-xs">
                        Clear selection
                      </SelectItem>
                      <div className="h-[1px] bg-white/10 my-1 mx-2" />
                      {templates.map((template) => (
                        <SelectItem
                          key={template.id}
                          value={template.id}
                          className="focus:bg-white/10 focus:text-white cursor-pointer py-2.5"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-white/90 text-sm">{template.name}</span>
                            <span className="text-[10px] text-white/40">{template.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="p-2 rounded-full text-white/30 hover:text-white hover:bg-white/10 transition-colors">
                        <SlidersHorizontal className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black/90 border-white/10 text-white text-xs">
                      Settings
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Prompt Input */}
              <div className="relative px-6 py-4 focus-within:ring-1 focus-within:ring-white/20 rounded-2xl transition-all">
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your automation... (e.g., 'Send me a Slack notification for important emails')"
                  className="w-full bg-transparent border-none text-white placeholder:text-white/30 text-lg leading-relaxed resize-none focus:outline-none min-h-[120px] max-h-[300px]"
                />

                {/* Bottom Bar: Attachments & Actions */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-medium text-white/60 hover:text-white transition-all group/attach">
                      <Paperclip className="w-3.5 h-3.5 group-hover/attach:text-blue-400 transition-colors" />
                      <span>Attach context</span>
                    </button>
                    <button className="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/5 bg-transparent hover:bg-white/5 group/mic">
                      <Mic className="w-4 h-4 group-hover/mic:text-red-400 transition-colors" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-[10px] text-white/20 font-mono tracking-widest uppercase">
                      {prompt.length > 0 ? `${prompt.length} chars` : 'Ready'}
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading || !prompt.trim()}
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                        isLoading || !prompt.trim()
                          ? "bg-white/10 text-white/30 cursor-not-allowed"
                          : "bg-white text-black hover:scale-110 shadow-[0_0_15px_-3px_rgba(255,255,255,0.5)]"
                      )}
                    >
                      {isLoading ? (
                        <Zap className={cn("w-4 h-4 animate-spin-slow", prompt.trim() ? "text-black" : "text-white")} />
                      ) : (
                        <Send className="w-4 h-4 ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </TooltipProvider>
        </div>
      </div>
    </AuroraBackground>
  );
}
