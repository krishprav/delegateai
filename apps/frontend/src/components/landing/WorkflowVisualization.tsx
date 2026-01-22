import { useState, useEffect } from 'react';
import {
    ReactFlow,
    Handle,
    Position,
    Background,
    type Node,
    type NodeProps,
    BaseEdge,
    getBezierPath,
    type EdgeProps,
    useNodesState,
    useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
    Mail,
    Send,
    Bot,
    Settings,
    Database,
    Webhook,
    FileSpreadsheet,
    MessageSquare,
    Clock,
    Code,
    Filter
} from 'lucide-react';

// --- Styles Helper (extracted from ActionNode.tsx) ---
const getActionColor = (actionType: string) => {
    switch (actionType) {
        case "TelegramNodeType":
            return {
                border: "border-[#24A1DE]",
                shadow: "shadow-[0_4px_14px_0_rgba(36,161,222,0.3)]",
                iconBg: "bg-[#24A1DE]/20",
                iconColor: "text-[#24A1DE]",
                gradient: "from-[#24A1DE]/10"
            };
        case "GmailTrigger":
            return {
                border: "border-[#EA4335]",
                shadow: "shadow-[0_4px_14px_0_rgba(234,67,53,0.3)]",
                iconBg: "bg-[#EA4335]/20",
                iconColor: "text-[#EA4335]",
                gradient: "from-[#EA4335]/10"
            };
        case "openAiNodeType":
            return {
                border: "border-[#10A37F]",
                shadow: "shadow-[0_4px_14px_0_rgba(16,163,127,0.3)]",
                iconBg: "bg-[#10A37F]/20",
                iconColor: "text-[#10A37F]",
                gradient: "from-[#10A37F]/10"
            };
        case "WebHookNodeType":
            return {
                border: "border-[#F43F5E]",
                shadow: "shadow-[0_4px_14px_0_rgba(244,63,94,0.3)]",
                iconBg: "bg-[#F43F5E]/20",
                iconColor: "text-[#F43F5E]",
                gradient: "from-[#F43F5E]/10"
            };
        case "PostgresNodeType":
            return {
                border: "border-[#336791]",
                shadow: "shadow-[0_4px_14px_0_rgba(51,103,145,0.3)]",
                iconBg: "bg-[#336791]/20",
                iconColor: "text-[#336791]",
                gradient: "from-[#336791]/10"
            };
        case "GoogleSheetsNodeType":
            return {
                border: "border-[#0F9D58]",
                shadow: "shadow-[0_4px_14px_0_rgba(15,157,88,0.3)]",
                iconBg: "bg-[#0F9D58]/20",
                iconColor: "text-[#0F9D58]",
                gradient: "from-[#0F9D58]/10"
            };
        case "FilterNodeType":
            return {
                border: "border-[#F4B400]",
                shadow: "shadow-[0_4px_14px_0_rgba(244,180,0,0.3)]",
                iconBg: "bg-[#F4B400]/20",
                iconColor: "text-[#F4B400]",
                gradient: "from-[#F4B400]/10"
            };
        case "SlackNodeType":
            return {
                border: "border-[#4A154B]",
                shadow: "shadow-[0_4px_14px_0_rgba(74,21,75,0.3)]",
                iconBg: "bg-[#4A154B]/20",
                iconColor: "text-[#4A154B]",
                gradient: "from-[#4A154B]/10"
            };
        case "DiscordNodeType":
            return {
                border: "border-[#5865F2]",
                shadow: "shadow-[0_4px_14px_0_rgba(88,101,242,0.3)]",
                iconBg: "bg-[#5865F2]/20",
                iconColor: "text-[#5865F2]",
                gradient: "from-[#5865F2]/10"
            };
        case "ResendNodeType":
            return {
                border: "border-[#000000]",
                shadow: "shadow-[0_4px_14px_0_rgba(0,0,0,0.3)]",
                iconBg: "bg-[#000000]/20",
                iconColor: "text-[#000000]",
                gradient: "from-[#000000]/10"
            };
        case "openRouterNodeType":
            return {
                border: "border-[#FF6B00]",
                shadow: "shadow-[0_4px_14px_0_rgba(255,107,0,0.3)]",
                iconBg: "bg-[#FF6B00]/20",
                iconColor: "text-[#FF6B00]",
                gradient: "from-[#FF6B00]/10"
            };
        case "AwsS3NodeType":
            return {
                border: "border-[#FF9900]",
                shadow: "shadow-[0_4px_14px_0_rgba(255,153,0,0.3)]",
                iconBg: "bg-[#FF9900]/20",
                iconColor: "text-[#FF9900]",
                gradient: "from-[#FF9900]/10"
            };
        case "DelayNodeType":
            return {
                border: "border-[#9C27B0]",
                shadow: "shadow-[0_4px_14px_0_rgba(156,39,176,0.3)]",
                iconBg: "bg-[#9C27B0]/20",
                iconColor: "text-[#9C27B0]",
                gradient: "from-[#9C27B0]/10"
            };
        case "CodeNodeType":
            return {
                border: "border-[#00BCD4]",
                shadow: "shadow-[0_4px_14px_0_rgba(0,188,212,0.3)]",
                iconBg: "bg-[#00BCD4]/20",
                iconColor: "text-[#00BCD4]",
                gradient: "from-[#00BCD4]/10"
            };
        default:
            return {
                border: "border-gray-500",
                shadow: "shadow-[0_4px_14px_0_rgba(107,114,128,0.3)]",
                iconBg: "bg-gray-500/20",
                iconColor: "text-gray-400",
                gradient: "from-gray-500/10"
            };
    }
};

const getActionIcon = (actionType: string) => {
    switch (actionType) {
        case "TelegramNodeType": return <Send className="w-6 h-6 text-cyan-400" />;
        case "GmailTrigger": return <Mail className="w-6 h-6 text-red-400" />;
        case "openAiNodeType": return <Bot className="w-6 h-6 text-green-400" />;
        case "WebHookNodeType": return <Webhook className="w-6 h-6 text-purple-400" />;
        case "PostgresNodeType": return <Database className="w-6 h-6 text-blue-400" />;
        case "GoogleSheetsNodeType": return <FileSpreadsheet className="w-6 h-6 text-emerald-400" />;
        case "FilterNodeType": return <Filter className="w-6 h-6 text-yellow-400" />;
        case "SlackNodeType": return <MessageSquare className="w-6 h-6 text-purple-500" />;
        case "DiscordNodeType": return <MessageSquare className="w-6 h-6 text-indigo-500" />;
        case "ResendNodeType": return <Send className="w-6 h-6 text-black" />;
        case "openRouterNodeType": return <Bot className="w-6 h-6 text-orange-500" />;
        case "AwsS3NodeType": return <Database className="w-6 h-6 text-orange-400" />;
        case "DelayNodeType": return <Clock className="w-6 h-6 text-purple-400" />;
        case "CodeNodeType": return <Code className="w-6 h-6 text-cyan-400" />;
        default: return <Settings className="w-6 h-6 text-gray-400" />;
    }
};

// --- Custom Node Component ---
interface CustomNodeData extends Record<string, unknown> {
    label: string;
    actionType: string;
    subtext?: string;
    status?: string;
}

const CustomNode = ({ data }: NodeProps<Node<CustomNodeData>>) => {
    const actionType = data.actionType;
    const styles = getActionColor(actionType);
    const actionIcon = getActionIcon(actionType);
    const isProcessing = data.status === 'Processing...';

    return (
        <div className={`rounded-2xl bg-[#1e1e1e] border-2 transition-all duration-300 relative min-w-[220px] group ${styles.border} ${styles.shadow}`}>
            <Handle
                type="target"
                position={Position.Left}
                className="w-3 h-3 bg-[#1e1e1e] border-2 border-white/50 transition-colors hover:border-white"
            />

            {/* Node Content */}
            <div className="p-4 relative overflow-hidden">
                <div className="flex items-center gap-4 relative z-10">
                    {/* Icon Box */}
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border border-white/5 shadow-sm ${styles.iconBg} ${styles.iconColor}`}>
                        <div className="transform transition-transform group-hover:scale-110 duration-300">
                            {actionIcon}
                        </div>
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-white font-bold text-sm truncate leading-tight">
                            {data.label}
                        </span>

                        {/* Subtext Area */}
                        {data.subtext && (
                            <div className="mt-1.5 inline-flex items-center">
                                {isProcessing && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse mr-2 shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                                )}
                                <span className={`text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/5 font-mono truncate ${isProcessing ? 'text-yellow-400/90' : 'text-gray-400'}`}>
                                    {data.subtext}
                                </span>
                            </div>
                        )}
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
};

const nodeTypes = {
    custom: CustomNode,
};

// --- Custom Edge Component ---
const CustomEdge = ({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
}: EdgeProps) => {
    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    return (
        <>
            <BaseEdge
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    stroke: 'rgba(255, 255, 255, 0.1)',
                    strokeWidth: 2,
                    ...style
                }}
            />
            <path
                d={edgePath}
                fill="none"
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth={2}
                strokeDasharray="5,5"
                className="animate-[dash_1s_linear_infinite]"
                style={{
                    strokeDashoffset: 10,
                }}
            />
        </>
    );
};

const edgeTypes = {
    animated: CustomEdge,
};

// --- Workflow Scenarios ---
const workflowScenarios = [
    {
        title: "AI Order Processor",
        nodes: [
            { id: '1', type: 'custom', data: { label: 'Webhook', actionType: 'WebHookNodeType', subtext: 'POST /order/new' }, position: { x: 50, y: 250 } },
            { id: '2', type: 'custom', data: { label: 'AI Analyze', actionType: 'openAiNodeType', subtext: 'Sentiment Analysis', status: 'Processing...' }, position: { x: 350, y: 250 } },
            { id: '3', type: 'custom', data: { label: 'Condition', actionType: 'FilterNodeType', subtext: 'If Positive' }, position: { x: 650, y: 250 } },
            { id: '4', type: 'custom', data: { label: 'Postgres', actionType: 'PostgresNodeType', subtext: 'Save Order' }, position: { x: 950, y: 100 } },
            { id: '5', type: 'custom', data: { label: 'Google Sheets', actionType: 'GoogleSheetsNodeType', subtext: 'Add Row' }, position: { x: 1250, y: 100 } },
            { id: '6', type: 'custom', data: { label: 'Gmail', actionType: 'GmailTrigger', subtext: 'Send Receipt' }, position: { x: 950, y: 400 } },
            { id: '7', type: 'custom', data: { label: 'Telegram', actionType: 'TelegramNodeType', subtext: 'Notify Team' }, position: { x: 1250, y: 400 } },
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'animated' },
            { id: 'e2-3', source: '2', target: '3', type: 'animated' },
            { id: 'e3-4', source: '3', target: '4', type: 'animated' },
            { id: 'e4-5', source: '4', target: '5', type: 'animated' },
            { id: 'e3-6', source: '3', target: '6', type: 'animated' },
            { id: 'e6-7', source: '6', target: '7', type: 'animated' },
        ],
    },
    {
        title: "Customer Support Automation",
        nodes: [
            { id: '1', type: 'custom', data: { label: 'Gmail', actionType: 'GmailTrigger', subtext: 'New Support Email' }, position: { x: 50, y: 200 } },
            { id: '2', type: 'custom', data: { label: 'AI Classify', actionType: 'openAiNodeType', subtext: 'Ticket Classification', status: 'Processing...' }, position: { x: 350, y: 200 } },
            { id: '3', type: 'custom', data: { label: 'Filter', actionType: 'FilterNodeType', subtext: 'Priority Level' }, position: { x: 650, y: 200 } },
            { id: '4', type: 'custom', data: { label: 'Slack', actionType: 'SlackNodeType', subtext: 'Notify Team' }, position: { x: 950, y: 100 } },
            { id: '5', type: 'custom', data: { label: 'Delay', actionType: 'DelayNodeType', subtext: 'Wait 24h' }, position: { x: 950, y: 300 } },
            { id: '6', type: 'custom', data: { label: 'Resend', actionType: 'ResendNodeType', subtext: 'Send Follow-up' }, position: { x: 1250, y: 300 } },
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'animated' },
            { id: 'e2-3', source: '2', target: '3', type: 'animated' },
            { id: 'e3-4', source: '3', target: '4', type: 'animated' },
            { id: 'e3-5', source: '3', target: '5', type: 'animated' },
            { id: 'e5-6', source: '5', target: '6', type: 'animated' },
        ],
    },
    {
        title: "Content Creation Pipeline",
        nodes: [
            { id: '1', type: 'custom', data: { label: 'Webhook', actionType: 'WebHookNodeType', subtext: 'New Blog Idea' }, position: { x: 50, y: 200 } },
            { id: '2', type: 'custom', data: { label: 'AI Writer', actionType: 'openRouterNodeType', subtext: 'Generate Draft', status: 'Processing...' }, position: { x: 350, y: 200 } },
            { id: '3', type: 'custom', data: { label: 'Code', actionType: 'CodeNodeType', subtext: 'Format Content' }, position: { x: 650, y: 200 } },
            { id: '4', type: 'custom', data: { label: 'Google Sheets', actionType: 'GoogleSheetsNodeType', subtext: 'Store Draft' }, position: { x: 950, y: 100 } },
            { id: '5', type: 'custom', data: { label: 'Discord', actionType: 'DiscordNodeType', subtext: 'Send Notification' }, position: { x: 950, y: 300 } },
            { id: '6', type: 'custom', data: { label: 'AWS S3', actionType: 'AwsS3NodeType', subtext: 'Upload Images' }, position: { x: 1250, y: 200 } },
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'animated' },
            { id: 'e2-3', source: '2', target: '3', type: 'animated' },
            { id: 'e3-4', source: '3', target: '4', type: 'animated' },
            { id: 'e3-5', source: '3', target: '5', type: 'animated' },
            { id: 'e4-6', source: '4', target: '6', type: 'animated' },
        ],
    },
    {
        title: "Data Integration Workflow",
        nodes: [
            { id: '1', type: 'custom', data: { label: 'Postgres', actionType: 'PostgresNodeType', subtext: 'Fetch Users' }, position: { x: 50, y: 200 } },
            { id: '2', type: 'custom', data: { label: 'AI Enrich', actionType: 'openAiNodeType', subtext: 'Profile Analysis', status: 'Processing...' }, position: { x: 350, y: 200 } },
            { id: '3', type: 'custom', data: { label: 'Google Sheets', actionType: 'GoogleSheetsNodeType', subtext: 'Update Sheet' }, position: { x: 650, y: 100 } },
            { id: '4', type: 'custom', data: { label: 'AWS S3', actionType: 'AwsS3NodeType', subtext: 'Export CSV' }, position: { x: 650, y: 300 } },
            { id: '5', type: 'custom', data: { label: 'Resend', actionType: 'ResendNodeType', subtext: 'Email Report' }, position: { x: 950, y: 200 } },
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'animated' },
            { id: 'e2-3', source: '2', target: '3', type: 'animated' },
            { id: 'e2-4', source: '2', target: '4', type: 'animated' },
            { id: 'e3-5', source: '3', target: '5', type: 'animated' },
            { id: 'e4-5', source: '4', target: '5', type: 'animated' },
        ],
    },
];

export function WorkflowVisualization() {
    const [currentScenario, setCurrentScenario] = useState(0);
    const [nodes, setNodes, onNodesChange] = useNodesState(workflowScenarios[0].nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(workflowScenarios[0].edges);

    const [isInteracted, setIsInteracted] = useState(false);

    // Cycle through workflow scenarios every 8 seconds unless interacted
    useEffect(() => {
        if (isInteracted) return;

        const interval = setInterval(() => {
            setCurrentScenario((prev) => (prev + 1) % workflowScenarios.length);
        }, 8000);

        return () => clearInterval(interval);
    }, [isInteracted]);

    const onInteraction = () => {
        if (!isInteracted) {
            setIsInteracted(true);
        }
    };

    // Update nodes and edges when scenario changes
    useEffect(() => {
        setNodes(workflowScenarios[currentScenario].nodes);
        setEdges(workflowScenarios[currentScenario].edges);
    }, [currentScenario, setNodes, setEdges]);

    return (
        <div className="w-full flex justify-center py-10 px-4">
            {/* iMac Stand and Body Container */}
            <div className="relative group w-full max-w-[1000px]">
                {/* iMac Body */}
                <div className="relative w-full aspect-video bg-[#0d0d0d] rounded-[32px] border-[14px] border-[#1a1a1a] shadow-2xl overflow-hidden flex flex-col z-10">

                    {/* Screen Content (Workflow) */}
                    <div className="flex-1 bg-[#050505] relative overflow-hidden">
                        {/* Fake macOS Status Bar (Integrated into display, optional/subtle) */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] font-mono text-white/40 z-10 pointer-events-none select-none uppercase tracking-widest">
                            {workflowScenarios[currentScenario].title}
                        </div>



                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onNodeDragStart={onInteraction}
                            onPaneClick={onInteraction}
                            onMoveStart={onInteraction}
                            nodeTypes={nodeTypes}
                            edgeTypes={edgeTypes}
                            fitView
                            fitViewOptions={{ padding: 0.2 }}
                            proOptions={{ hideAttribution: true }}
                            nodesConnectable={true}
                            nodesDraggable={true}
                            zoomOnScroll={true}
                            zoomOnPinch={true}
                            panOnDrag={true}
                            elementsSelectable={true}
                            minZoom={0.5}
                            maxZoom={1.5}
                        >
                            <Background color="#1a1a1a" gap={24} size={1} />
                        </ReactFlow>
                    </div>

                    {/* Chin (Bottom Bezel) */}
                    <div className="h-12 bg-[#1a1a1a] flex items-center justify-center border-t border-white/5 relative z-20">
                        {/* Apple Logo Placeholder or Brand */}
                        <div className="w-4 h-4 text-white/10">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>
                        </div>
                    </div>
                </div>

                {/* Stand */}
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-48 h-24 bg-gradient-to-b from-[#e2e2e2] to-[#b0b0b0] rounded-b-xl -z-0 shadow-xl clip-path-stand flex flex-col items-center pt-2">
                    <div className="w-full h-1 bg-[#000000]/20 blur-sm"></div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}} />
        </div>
    );
}
