import { Handle, Position } from '@xyflow/react';
import { Zap, Webhook, Clock, Mail } from 'lucide-react';

const icons: Record<string, any> = {
    manual: Zap,
    manualTrigger: Zap,
    webhook: Webhook,
    webhookTrigger: Webhook,
    schedule: Clock,
    scheduleTrigger: Clock,
    email: Mail,
    emailTrigger: Mail,
    GmailTrigger: Mail,
};

export const HeroTriggerNode = ({ data }: { data: any }) => {
    const Icon = icons[data.type] || Zap;

    return (
        <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>

            <div className="relative bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 rounded-xl p-4 min-w-[180px] shadow-2xl">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 rounded-lg border border-teal-500/30">
                        <Icon className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white tracking-wide">{data.label}</div>
                        <div className="text-[10px] text-teal-200/50 uppercase font-medium tracking-wider mt-0.5">Trigger</div>
                    </div>
                </div>
            </div>

            <Handle type="source" position={Position.Right} className="!bg-teal-500 !w-3 !h-3 !border-4 !border-[#0A0A0A]" />
        </div>
    );
};
