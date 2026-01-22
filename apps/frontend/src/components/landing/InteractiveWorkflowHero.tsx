import { Background, ReactFlow, useEdgesState, useNodesState } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { HeroActionNode } from "./hero-nodes/HeroActionNode";
import { HeroEdge } from "./hero-nodes/HeroEdge";
import { HeroTriggerNode } from "./hero-nodes/HeroTriggerNode";

const nodeTypes = {
    heroTrigger: HeroTriggerNode,
    heroAction: HeroActionNode,
};

const edgeTypes = {
    hero: HeroEdge,
};

const initialNodes = [
    {
        id: "1",
        type: "heroTrigger",
        position: { x: 0, y: 150 },
        data: { label: "New Issue", type: "webhook" },
    },
    {
        id: "2",
        type: "heroAction",
        position: { x: 250, y: 50 },
        data: { label: "Analyze Impact", subLabel: "AI Agent", type: "openai" },
    },
    {
        id: "3",
        type: "heroAction",
        position: { x: 550, y: 50 },
        data: { label: "Create Task", subLabel: "Trello", type: "trello" },
    },
    {
        id: "4",
        type: "heroAction",
        position: { x: 550, y: 250 },
        data: { label: "Notify Team", subLabel: "Slack", type: "slack" },
    },
];

const initialEdges = [
    { id: "e1-2", source: "1", target: "2", type: "hero", animated: true },
    { id: "e2-3", source: "2", target: "3", type: "hero", animated: true },
    { id: "e2-4", source: "2", target: "4", type: "hero", animated: true },
];

export const InteractiveWorkflowHero = () => {
    const [nodes, , onNodesChange] = useNodesState(initialNodes);
    const [edges, , onEdgesChange] = useEdgesState(initialEdges);

    return (
        <div className="w-full flex justify-center py-10 px-4">
            {/* iMac Stand and Body Container */}
            <div className="relative group w-full max-w-[1000px]">
                {/* iMac Body */}
                <div className="relative w-full aspect-video bg-[#0d0d0d] rounded-[32px] border-[14px] border-[#1a1a1a] shadow-2xl overflow-hidden flex flex-col z-10">

                    {/* Screen Content */}
                    <div className="flex-1 bg-[#050505] relative overflow-hidden">
                        {/* Status Bar */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] font-mono text-white/40 z-10 pointer-events-none select-none uppercase tracking-widest">
                            System Operational
                        </div>

                        {/* Floating Badge */}
                        <div className="absolute bottom-6 left-6 z-20 flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-md border border-white/10 rounded-full">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-xs font-medium text-white/80">Active</span>
                        </div>

                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            nodeTypes={nodeTypes}
                            edgeTypes={edgeTypes}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            fitView
                            fitViewOptions={{ padding: 0.2 }}
                            proOptions={{ hideAttribution: true }}
                            panOnScroll={true}
                            zoomOnScroll={true}
                            nodesDraggable={true}
                            nodesConnectable={false}
                            elementsSelectable={true}
                            panOnDrag={true}
                        >
                            <Background gap={20} size={1} color="#333" />
                        </ReactFlow>
                    </div>

                    {/* Chin (Bottom Bezel) */}
                    <div className="h-12 bg-[#1a1a1a] flex items-center justify-center border-t border-white/5 relative z-20">
                        {/* Apple Logo Placeholder */}
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
        </div>
    );
};
