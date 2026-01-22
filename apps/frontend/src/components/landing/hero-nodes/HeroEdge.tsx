import { BaseEdge, type EdgeProps, getSmoothStepPath } from '@xyflow/react';

export const HeroEdge = ({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
}: EdgeProps) => {
    const [edgePath] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, stroke: '#334155', strokeWidth: 2 }} />
            <BaseEdge
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    ...style,
                    strokeWidth: 2,
                    stroke: '#2dd4bf', // teal-400
                    strokeDasharray: 5,
                    animation: 'dashdraw 1s linear infinite',
                    opacity: 0.6,
                }}
                className="animated-edge-overlay"
            />
            <style>
                {`
          @keyframes dashdraw {
            from {
              stroke-dashoffset: 20;
            }
            to {
              stroke-dashoffset: 0;
            }
          }
        `}
            </style>
        </>
    );
};
