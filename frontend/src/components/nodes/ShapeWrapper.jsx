/**
 * ShapeWrapper.jsx — Highly Polished Premium Edition v4
 *
 * Implements custom, high-contrast, premium SVG shapes for ReactFlow:
 *   - Cylinder (Databases) with 3D metallic top/bottom caps and vertical body gradients.
 *   - Hexagon (Services) with flat top, clipped top header band, and accent gradient.
 *   - Diamond (Gateways/Auth) with radial glow and centered icon layout.
 *   - Parallelogram (Queues) — fully SVG-based with a matching skewed header band (prevents leaks/gaps).
 *   - Cloud (SaaS/S3) — clean, fluffy bezier cloud with radial glow and centered layout.
 *   - Rect (Default Cards) — premium card layout.
 *
 * Major V4 fix:
 *   ReactFlow connection handles (<Handle>) are automatically partitioned from the content
 *   and rendered as direct children of the outer relative node wrapper (node-shape-root).
 *   This ensures handles are positioned relative to the root node box, are fully visible,
 *   and never clipped by the inner containers' 'overflow: hidden'.
 */

import React, { useId } from 'react';
import './nodeShapes.css';
import { NODE_SHAPE_CONFIG } from './nodeShapeConfig';

const ACCENT = {
  slate:   { border: '#94a3b8', ring: 'rgba(148,163,184,0.3)', header: '#334155', glow: '148,163,184', text: '#94a3b8' },
  emerald: { border: '#10b981', ring: 'rgba(16,185,129,0.3)',  header: '#047857', glow: '16,185,129',  text: '#34d399' },
  indigo:  { border: '#6366f1', ring: 'rgba(99,102,241,0.3)',  header: '#4338ca', glow: '99,102,241',  text: '#818cf8' },
  cyan:    { border: '#06b6d4', ring: 'rgba(6,182,212,0.3)',   header: '#0e7490', glow: '6,182,212',   text: '#22d3ee' },
  violet:  { border: '#8b5cf6', ring: 'rgba(139,92,246,0.3)',  header: '#6d28d9', glow: '139,92,246',  text: '#a78bfa' },
  sky:     { border: '#0ea5e9', ring: 'rgba(14,165,233,0.3)',  header: '#0369a1', glow: '14,165,233',  text: '#38bdf8' },
  amber:   { border: '#f59e0b', ring: 'rgba(245,158,11,0.3)',  header: '#b45309', glow: '245,158,11',  text: '#fbbf24' },
  orange:  { border: '#f97316', ring: 'rgba(249,115,22,0.3)',  header: '#c2410c', glow: '249,115,22',  text: '#fb923c' },
  purple:  { border: '#a855f7', ring: 'rgba(168,85,247,0.3)',  header: '#7e22ce', glow: '168,85,247',  text: '#c084fc' },
  fuchsia: { border: '#d946ef', ring: 'rgba(217,70,239,0.3)',  header: '#a21caf', glow: '217,70,239',  text: '#f472b6' },
  rose:    { border: '#f43f5e', ring: 'rgba(244,63,94,0.3)',   header: '#be123c', glow: '244,63,94',   text: '#fca5a5' },
  blue:    { border: '#3b82f6', ring: 'rgba(59,130,246,0.3)',  header: '#1d4ed8', glow: '59,130,246',  text: '#60a5fa' },
  red:     { border: '#ef4444', ring: 'rgba(239,68,68,0.3)',   header: '#b91c1c', glow: '239,68,68',   text: '#f87171' },
};

function getAccent(t) { return ACCENT[NODE_SHAPE_CONFIG[t]?.accentClass] ?? ACCENT.slate; }
function getShape(t)  { return NODE_SHAPE_CONFIG[t]?.shape ?? 'rect'; }

/* Helper to partition ReactFlow Handles from node content */
function partitionChildren(children) {
  const handles = [];
  const content = [];

  React.Children.forEach(children, child => {
    if (!child) return;

    // ReactFlow Handles always have a position prop, or name/displayName 'Handle'
    const isHandle =
      child.type?.displayName === 'Handle' ||
      child.type?.name === 'Handle' ||
      child.props?.position !== undefined;

    if (isHandle) {
      handles.push(child);
    } else {
      content.push(child);
    }
  });

  return { content, handles };
}

/* ═══════════════════════════════════════════════════════════════════════════
   RECT — Standard clean layout
═══════════════════════════════════════════════════════════════════════════ */
function RectShape({ content, handles, selected, accent }) {
  return (
    <div
      className={`node-shape-root ${selected ? 'node-selected' : ''}`}
      style={{
        background: 'var(--bg-surface)',
        border: `2px solid ${selected ? accent.border : 'var(--border-main)'}`,
        borderRadius: '1rem',
        overflow: 'hidden',
        minWidth: 200,
        minHeight: 80,
        boxShadow: selected
          ? `0 0 0 3px ${accent.ring}, 0 12px 32px rgba(0,0,0,0.35), 0 0 20px rgba(${accent.glow},0.2)`
          : '0 8px 24px rgba(0,0,0,0.15)',
        transition: 'all 0.2s ease',
      }}
    >
      {content}
      {handles}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PARALLELOGRAM — Pure SVG-based layout with shape clipping
═══════════════════════════════════════════════════════════════════════════ */
function ParallelogramShape({ content, handles, selected, accent }) {
  const uid = useId().replace(/:/g, '_');
  const W = 230;
  const H = 120;
  const S = 18; // skew offset in px

  const pts = `${S},2 ${W-2},2 ${W-S-2},${H-2} 2,${H-2}`;
  const strokeColor = selected ? accent.border : 'var(--border-main)';
  const strokeWidth = selected ? 2.5 : 1.5;

  return (
    <div
      className="node-shape-root"
      style={{
        position: 'relative',
        width: W,
        height: H,
        display: 'inline-block',
        filter: `drop-shadow(0 8px 20px rgba(0,0,0,0.25)) ${selected ? `drop-shadow(0 0 12px rgba(${accent.glow},0.35))` : ''}`,
        transition: 'filter 0.2s ease',
      }}
    >
      <svg
        width={W} height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <defs>
          <clipPath id={`para-clip-${uid}`}>
            <polygon points={pts} />
          </clipPath>
          <linearGradient id={`para-hdr-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent.header} />
            <stop offset="100%" stopColor={accent.header} stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Selection glow border */}
        {selected && (
          <polygon
            points={`${S-4},-2 ${W+2},-2 ${W-S+4},${H+2} -4,${H+2}`}
            fill="none" stroke={accent.ring} strokeWidth={6}
          />
        )}

        {/* Main Background */}
        <polygon
          points={pts}
          fill="var(--bg-surface)"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />

        {/* Skewed Header Area (clipped to shape) */}
        <rect
          x={0} y={0}
          width={W} height={40}
          fill={`url(#para-hdr-${uid})`}
          clipPath={`url(#para-clip-${uid})`}
        />

        {/* Header divider stroke (clipped to shape) */}
        <line
          x1={0} y1={40}
          x2={W} y2={40}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          clipPath={`url(#para-clip-${uid})`}
        />
      </svg>

      {/* Skewed-aligned content area: offset left/right to stay inside the polygon */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          padding: `0px ${S + 10}px 0px ${S + 6}px`,
        }}
      >
        {content}
      </div>

      {/* Render Handles outside the content wrapper to avoid clipping and allow absolute edge positioning */}
      {handles}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CYLINDER — 3D metallic-styled database container with shape clipping
═══════════════════════════════════════════════════════════════════════════ */
function CylinderShape({ content, handles, selected, accent }) {
  const uid = useId().replace(/:/g, '_');
  const W = 190;
  const H = 150;
  const RX = 93; // horizontal radius
  const RY = 14; // vertical radius of caps

  const strokeColor = selected ? accent.border : 'var(--border-main)';
  const strokeWidth = selected ? 2.5 : 1.5;

  // The path representing the 3D cylinder outline
  const cylinderPath = `M ${W/2 - RX},${RY} L ${W/2 - RX},${H - RY} A ${RX},${RY} 0 0 0 ${W/2 + RX},${H - RY} L ${W/2 + RX},${RY} A ${RX},${RY} 0 0 0 ${W/2 - RX},${RY}`;

  return (
    <div
      className="node-shape-root"
      style={{
        position: 'relative',
        width: W,
        height: H,
        display: 'inline-block',
        filter: `drop-shadow(0 8px 24px rgba(0,0,0,0.3)) ${selected ? `drop-shadow(0 0 14px rgba(${accent.glow},0.35))` : ''}`,
        transition: 'filter 0.2s ease',
      }}
    >
      <svg
        width={W} height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <defs>
          <clipPath id={`cyl-clip-${uid}`}>
            <path d={cylinderPath} />
          </clipPath>
          <linearGradient id={`cyl-grad-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0.03)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
          </linearGradient>
          <linearGradient id={`cyl-hdr-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent.header} />
            <stop offset="100%" stopColor={accent.header} stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Selection ring */}
        {selected && (
          <path
            d={`M ${W/2 - RX - 4},${RY} L ${W/2 - RX - 4},${H - RY} A ${RX+4},${RY+4} 0 0 0 ${W/2 + RX + 4},${H - RY} L ${W/2 + RX + 4},${RY} A ${RX+4},${RY+4} 0 0 0 ${W/2 - RX - 4},${RY}`}
            fill="none" stroke={accent.ring} strokeWidth={6}
          />
        )}

        {/* Main cylinder body back fill */}
        <path
          d={cylinderPath}
          fill="var(--bg-surface)"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />

        {/* 3D Vertical reflection shimmer */}
        <path
          d={cylinderPath}
          fill={`url(#cyl-grad-${uid})`}
        />

        {/* Header fill block for colored top zone (clipped to cylinder outline) */}
        <rect
          x={0} y={0}
          width={W} height={42}
          fill={`url(#cyl-hdr-${uid})`}
          clipPath={`url(#cyl-clip-${uid})`}
        />

        {/* Bottom cylinder ellipse cap */}
        <ellipse
          cx={W/2} cy={H - RY}
          rx={RX} ry={RY}
          fill="var(--bg-surface)"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />

        {/* Top cylinder ellipse cap (drawn on top to cap the header ellipse) */}
        <ellipse
          cx={W/2} cy={RY}
          rx={RX} ry={RY}
          fill={accent.header}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />

        {/* Header divider stroke (clipped to shape) */}
        <line
          x1={0} y1={42}
          x2={W} y2={42}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          clipPath={`url(#cyl-clip-${uid})`}
        />
      </svg>

      {/* Content wrapper: stacks header on top, body in center */}
      <div
        style={{
          position: 'absolute',
          top: RY,
          left: W/2 - RX + 2,
          width: RX * 2 - 4,
          height: H - RY * 2,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {content}
      </div>

      {/* Render Handles outside the content wrapper to avoid clipping and allow absolute edge positioning */}
      {handles}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HEXAGON — Sleek services design with shape clipping
═══════════════════════════════════════════════════════════════════════════ */
function HexagonShape({ content, handles, selected, accent }) {
  const uid = useId().replace(/:/g, '_');
  const W = 210;
  const H = 150;

  // Hexagon points (flat-topped)
  const pts = `${W*0.25},2 ${W*0.75},2 ${W-2},${H*0.5} ${W*0.75},${H-2} ${W*0.25},${H-2} 2,${H*0.5}`;
  const strokeColor = selected ? accent.border : 'var(--border-main)';
  const strokeWidth = selected ? 2.5 : 1.5;

  return (
    <div
      className="node-shape-root"
      style={{
        position: 'relative',
        width: W,
        height: H,
        display: 'inline-block',
        filter: `drop-shadow(0 8px 20px rgba(0,0,0,0.25)) ${selected ? `drop-shadow(0 0 12px rgba(${accent.glow},0.35))` : ''}`,
        transition: 'filter 0.2s ease',
      }}
    >
      <svg
        width={W} height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <defs>
          <clipPath id={`hex-clip-${uid}`}>
            <polygon points={pts} />
          </clipPath>
          <linearGradient id={`hex-hdr-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent.header} />
            <stop offset="100%" stopColor={accent.header} stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Selection ring */}
        {selected && (
          <polygon
            points={`${W*0.25-6},-2 ${W*0.75+6},-2 ${W+6},${H*0.5} ${W*0.78+6},${H+2} ${W*0.25-6},${H+2} -6,${H*0.5}`}
            fill="none" stroke={accent.ring} strokeWidth={6}
          />
        )}

        {/* Main shape fill */}
        <polygon
          points={pts}
          fill="var(--bg-surface)"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />

        {/* Color-header band top segment (clipped to hexagon) */}
        <rect
          x={0} y={0}
          width={W} height={44}
          fill={`url(#hex-hdr-${uid})`}
          clipPath={`url(#hex-clip-${uid})`}
        />

        {/* Header divider line (clipped to hexagon) */}
        <line
          x1={0} y1={44}
          x2={W} y2={44}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          clipPath={`url(#hex-clip-${uid})`}
        />
      </svg>

      {/* Content wrapper: padded horizontally to stay within the hex vertices */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: `0px ${W * 0.18}px`,
        }}
      >
        {content}
      </div>

      {/* Render Handles outside the content wrapper to avoid clipping and allow absolute edge positioning */}
      {handles}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DIAMOND — Square aspect ratio rhombus (Rhombus)
═══════════════════════════════════════════════════════════════════════════ */
function DiamondShape({ content, handles, selected, accent }) {
  const uid = useId().replace(/:/g, '_');
  const S = 190; // Square box: makes handles land perfectly at 4 corners
  const pts = `${S/2},2 ${S-2},${S/2} ${S/2},${S-2} 2,${S/2}`;

  const strokeColor = selected ? accent.border : 'var(--border-main)';
  const strokeWidth = selected ? 2.5 : 1.5;

  return (
    <div
      className="node-shape-root"
      style={{
        position: 'relative',
        width: S,
        height: S,
        display: 'inline-block',
        filter: `drop-shadow(0 8px 24px rgba(0,0,0,0.25)) ${selected ? `drop-shadow(0 0 14px rgba(${accent.glow},0.35))` : ''}`,
        transition: 'filter 0.2s ease',
      }}
    >
      <svg
        width={S} height={S}
        viewBox={`0 0 ${S} ${S}`}
        style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`dia-rg-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accent.header} stopOpacity="0.25" />
            <stop offset="100%" stopColor={accent.header} stopOpacity="0.0" />
          </radialGradient>
        </defs>

        {/* Selection ring */}
        {selected && (
          <polygon
            points={`${S/2},-6 ${S+6},${S/2} ${S/2},${S+6} -6,${S/2}`}
            fill="none" stroke={accent.ring} strokeWidth={6}
          />
        )}

        {/* Rhombus background */}
        <polygon
          points={pts}
          fill="var(--bg-surface)"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />

        {/* Soft center radial glow */}
        <polygon
          points={pts}
          fill={`url(#dia-rg-${uid})`}
        />
      </svg>

      {/* Content wrapper: centered and padded to prevent text overflow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: S * 0.72,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        {content}
      </div>

      {/* Render Handles outside the content wrapper to avoid clipping and allow absolute edge positioning */}
      {handles}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CLOUD — External / SaaS integration cloud
═══════════════════════════════════════════════════════════════════════════ */
function CloudShape({ content, handles, selected, accent }) {
  const uid = useId().replace(/:/g, '_');
  const W = 210;
  const H = 125;

  // Polished clean cloud shape bezier path
  const cloudPath = `
    M ${W*0.22},${H*0.82}
    Q ${W*0.01},${H*0.82} ${W*0.01},${H*0.58}
    Q ${W*0.01},${H*0.34} ${W*0.19},${H*0.30}
    Q ${W*0.17},${H*0.06} ${W*0.39},${H*0.06}
    Q ${W*0.48},${H*-0.04} ${W*0.58},${H*0.06}
    Q ${W*0.74},${H*0.00} ${W*0.84},${H*0.18}
    Q ${W*1.02},${H*0.14} ${W*1.02},${H*0.40}
    Q ${W*1.02},${H*0.64} ${W*0.84},${H*0.70}
    Q ${W*0.84},${H*0.82} ${W*0.78},${H*0.82}
    Z
  `;

  const strokeColor = selected ? accent.border : 'var(--border-main)';
  const strokeWidth = selected ? 2.5 : 1.5;

  return (
    <div
      className="node-shape-root"
      style={{
        position: 'relative',
        width: W,
        height: H,
        display: 'inline-block',
        filter: `drop-shadow(0 8px 20px rgba(0,0,0,0.22)) ${selected ? `drop-shadow(0 0 12px rgba(${accent.glow},0.3))` : ''}`,
        transition: 'filter 0.2s ease',
      }}
    >
      <svg
        width={W} height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`cloud-rg-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accent.header} stopOpacity="0.22" />
            <stop offset="100%" stopColor={accent.header} stopOpacity="0.02" />
          </radialGradient>
        </defs>

        {/* Selection ring */}
        {selected && (
          <path
            d={cloudPath}
            fill="none" stroke={accent.ring} strokeWidth={6}
            strokeLinejoin="round"
          />
        )}

        {/* Cloud background */}
        <path
          d={cloudPath}
          fill="var(--bg-surface)"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />

        {/* Cloud soft glow overlay */}
        <path
          d={cloudPath}
          fill={`url(#cloud-rg-${uid})`}
        />
      </svg>

      {/* Content wrapper: centered within the main body of the cloud */}
      <div
        style={{
          position: 'absolute',
          top: H * 0.12,
          left: W * 0.12,
          width: W * 0.76,
          height: H * 0.68,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        {content}
      </div>

      {/* Render Handles outside the content wrapper to avoid clipping and allow absolute edge positioning */}
      {handles}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PUBLIC API
═══════════════════════════════════════════════════════════════════════════ */
export default function ShapeWrapper({ nodeType, selected, children }) {
  const shape  = getShape(nodeType);
  const accent = getAccent(nodeType);
  const { content, handles } = partitionChildren(children);

  const props  = { selected, accent, content, handles };

  switch (shape) {
    case 'cylinder':      return <CylinderShape      {...props} />;
    case 'hexagon':       return <HexagonShape       {...props} />;
    case 'diamond':       return <DiamondShape       {...props} />;
    case 'parallelogram': return <ParallelogramShape {...props} />;
    case 'cloud':         return <CloudShape         {...props} />;
    default:              return <RectShape          {...props} />;
  }
}
export { getAccent };
