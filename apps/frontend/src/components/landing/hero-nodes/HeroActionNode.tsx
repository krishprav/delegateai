import { Handle, Position } from '@xyflow/react';
import { Sparkles, Mail, FileText, Share2, Trello, Grid } from 'lucide-react';

const icons: Record<string, any> = {
    openai: Sparkles,
    openAiNodeType: Sparkles,
    gmail: Mail,
    GmailTrigger: Mail,
    sendEmail: Mail,
    google_drive: FileText,
    downloadFile: FileText,
    google_sheets: Grid,
    saveToGoogleSheets: Grid,
    trello: Trello,
    createTrelloCard: Trello,
    slack: Share2,
    twitter: Share2,
};

const getNodeStyles = (type: string) => {
    switch (type) {
        case 'slack':
            return {
                glow: 'from-purple-500 to-indigo-500',
                bg: 'from-purple-500/20 to-indigo-500/20',
                border: 'border-purple-500/30',
                icon: 'text-purple-400',
                handle: '!bg-purple-500',
                text: 'text-purple-200/50'
            };
        case 'trello':
            return {
                glow: 'from-blue-500 to-cyan-500',
                bg: 'from-blue-500/20 to-cyan-500/20',
                border: 'border-blue-500/30',
                icon: 'text-blue-400',
                handle: '!bg-blue-500',
                text: 'text-blue-200/50'
            };
        case 'openai':
        case 'openAiNodeType':
            return {
                glow: 'from-emerald-500 to-teal-500',
                bg: 'from-emerald-500/20 to-teal-500/20',
                border: 'border-emerald-500/30',
                icon: 'text-emerald-400',
                handle: '!bg-emerald-500',
                text: 'text-emerald-200/50'
            };
        case 'gmail':
        case 'sendEmail':
            return {
                glow: 'from-red-500 to-orange-500',
                bg: 'from-red-500/20 to-orange-500/20',
                border: 'border-red-500/30',
                icon: 'text-red-400',
                handle: '!bg-red-500',
                text: 'text-red-200/50'
            };
        case 'google_sheets':
        case 'saveToGoogleSheets':
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

export const HeroActionNode = ({ data }: { data: any }) => {
    const Icon = icons[data.type] || Sparkles;
    const styles = getNodeStyles(data.type);

    return (
        <div className="relative group">
            {/* Glow effect */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${styles.glow} rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500`}></div>

            <div className="relative bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 rounded-xl p-4 min-w-[180px] shadow-2xl">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 bg-gradient-to-br ${styles.bg} rounded-lg border ${styles.border}`}>
                        <Icon className={`w-5 h-5 ${styles.icon}`} />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white tracking-wide">{data.label}</div>
                        <div className={`text-[10px] uppercase font-medium tracking-wider mt-0.5 ${styles.text}`}>{data.subLabel || 'Action'}</div>
                    </div>
                </div>
            </div>

            <Handle type="target" position={Position.Left} className={`${styles.handle} !w-3 !h-3 !border-4 !border-[#0A0A0A]`} />
            <Handle type="source" position={Position.Right} className={`${styles.handle} !w-3 !h-3 !border-4 !border-[#0A0A0A]`} />
        </div>
    );
};
