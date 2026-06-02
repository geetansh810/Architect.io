/**
 * CustomEdge.jsx — Animated smart edge with protocol badges, flow animation, and hover effects
 */
import { memo, useState } from 'react';
import {
  getSmoothStepPath,
  EdgeLabelRenderer,
  BaseEdge,
  useReactFlow,
} from '@xyflow/react';

// Protocol color map
const PROTOCOL_COLORS = {
  REST:     { bg: '#1d4ed8', text: '#93c5fd', border: '#3b82f6' },
  gRPC:     { bg: '#4f46e5', text: '#c4b5fd', border: '#8b5cf6' },
  WebSocket:{ bg: '#0e7490', text: '#67e8f9', border: '#06b6d4' },
  'pub/sub':{ bg: '#9a3412', text: '#fdba74', border: '#f97316' },
  DB:       { bg: '#1e3a5f', text: '#93c5fd', border: '#60a5fa' },
  Redis:    { bg: '#991b1b', text: '#fca5a5', border: '#ef4444' },
  FK:       { bg: '#064e3b', text: '#6ee7b7', border: '#10b981' },
  Internal: { bg: '#1e1b4b', text: '#c4b5fd', border: '#6366f1' },
  HTTP:     { bg: '#4c1d95', text: '#f0abfc', border: '#d946ef' },
  default:  { bg: '#1e293b', text: '#94a3b8', border: '#475569' },
};

function getProtocolStyle(protocol) {
  return PROTOCOL_COLORS[protocol] || PROTOCOL_COLORS.default;
}

// Animated SVG dots along edge path
function FlowDots({ path, isAsync, color, animated }) {
  if (!animated) return null;
  return (
    <g>
      <circle r="3" fill={color} opacity="0.85">
        <animateMotion dur={isAsync ? '1.5s' : '2s'} repeatCount="indefinite" path={path} />
      </circle>
      <circle r="2" fill={color} opacity="0.5">
        <animateMotion dur={isAsync ? '1.5s' : '2s'} begin="0.4s" repeatCount="indefinite" path={path} />
      </circle>
    </g>
  );
}

const CustomEdge = memo(({
  id, source, target, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, selected, data, label,
  markerEnd, style,
}) => {
  const { setEdges } = useReactFlow();
  const [hovered, setHovered] = useState(false);

  const protocol  = data?.protocol || 'REST';
  const isAsync   = data?.isAsync  || false;
  const edgeLabel = data?.label    || label || '';

  const protocolStyle = getProtocolStyle(protocol);
  const isActive = selected || hovered;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
    borderRadius: 16,
  });

  // Edge stroke style
  const strokeColor  = isActive ? protocolStyle.border : `${protocolStyle.border}99`;
  const strokeWidth  = isActive ? 2.5 : 1.8;
  const strokeDash   = isAsync ? '8 4' : undefined;
  const glowFilter   = isActive ? `drop-shadow(0 0 6px ${protocolStyle.border}66)` : undefined;

  return (
    <>
      {/* Glow layer (selected) */}
      {isActive && (
        <path
          d={edgePath}
          fill="none"
          stroke={protocolStyle.border}
          strokeWidth={6}
          opacity={0.18}
          strokeDasharray={strokeDash}
          strokeLinecap="round"
        />
      )}

      {/* Main edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray: strokeDash,
          filter: glowFilter,
          transition: 'stroke 0.2s ease, stroke-width 0.2s ease',
          cursor: 'pointer',
        }}
        interactionWidth={12}
      />

      {/* Animated flow dots */}
      <FlowDots
        path={edgePath}
        isAsync={isAsync}
        color={protocolStyle.border}
        animated={isActive || isAsync}
      />

      {/* Invisible hit area for easier clicking */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: 'pointer' }}
      />

      {/* Label + Protocol badge */}
      <EdgeLabelRenderer>
        <div
          className="absolute pointer-events-none"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            zIndex: 5,
          }}
        >
          {(isActive || isAsync || edgeLabel) && (
            <div className="flex flex-col items-center gap-1">
              {/* Protocol badge */}
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border backdrop-blur-sm transition-all"
                style={{
                  background: protocolStyle.bg,
                  color: protocolStyle.text,
                  borderColor: protocolStyle.border,
                  opacity: isActive ? 1 : 0.7,
                  boxShadow: isActive ? `0 2px 12px ${protocolStyle.border}44` : 'none',
                }}
              >
                {isAsync && <span className="text-[8px]">⚡</span>}
                {protocol}
              </div>

              {/* Edge label */}
              {edgeLabel && (
                <div
                  className="text-[8px] font-bold px-1.5 py-0.5 rounded-lg backdrop-blur-sm"
                  style={{
                    background: 'var(--bg-surface)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-main)',
                    opacity: 1,
                    transition: 'opacity 0.2s ease',
                    whiteSpace: 'nowrap',
                    maxWidth: 120,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {edgeLabel}
                </div>
              )}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

CustomEdge.displayName = 'CustomEdge';
export default CustomEdge;
