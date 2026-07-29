/**
 * ShapeWrapper.jsx — AWS Enterprise Card Edition
 */
import React from 'react';
import './nodeShapes.css';
import { NODE_SHAPE_CONFIG } from './nodeShapeConfig';
import { 
  Globe, 
  Shield, 
  Cpu, 
  Database, 
  HardDrive, 
  GitCommit, 
  Mail, 
  Webhook, 
  Zap, 
  Clock, 
  Box
} from 'lucide-react';

const CATEGORY_MAP = {
  apiNode: {
    label: 'ENTRY POINT',
    title: 'API Endpoint',
    detail: (data) => `${data.method || 'POST'} ${data.route || '/users'}`,
    provider: (data) => data.provider || 'AWS API Gateway',
    icon: Globe,
    color: '#2563EB',
  },
  cdnNode: {
    label: 'ENTRY POINT',
    title: 'CDN / Edge',
    detail: (data) => data.domain || 'CDN Cache',
    provider: (data) => data.provider || 'Cloudflare CDN',
    icon: Globe,
    color: '#2563EB',
  },
  loadBalancerNode: {
    label: 'ENTRY POINT',
    title: 'Load Balancer',
    detail: (data) => data.algorithm || 'Round Robin',
    provider: (data) => data.provider || 'AWS ALB',
    icon: Globe,
    color: '#2563EB',
  },
  frontendNode: {
    label: 'ENTRY POINT',
    title: 'Web App',
    detail: (data) => data.tech || 'React Client',
    provider: (data) => data.description || 'CloudFront Host',
    icon: Globe,
    color: '#2563EB',
  },
  mobileNode: {
    label: 'ENTRY POINT',
    title: 'Mobile App',
    detail: (data) => data.tech || 'React Native',
    provider: (data) => data.description || 'App Store Client',
    icon: Globe,
    color: '#2563EB',
  },
  browserNode: {
    label: 'ENTRY POINT',
    title: 'Browser Client',
    detail: (data) => data.tech || 'Web Browser',
    provider: (data) => data.description || 'SPA Client',
    icon: Globe,
    color: '#2563EB',
  },
  authNode: {
    label: 'AUTHENTICATION',
    title: 'Authentication',
    detail: (data) => data.method || 'JWT Validation',
    provider: (data) => data.provider || 'Lambda Authorizer',
    icon: Shield,
    color: '#DC2626',
  },
  logicNode: {
    label: 'LOGIC / PROCESSING',
    title: 'Business Logic',
    detail: (data) => data.name || 'User Registration',
    provider: (data) => data.provider || 'Lambda Function',
    icon: Cpu,
    color: '#7C3AED',
  },
  middlewareNode: {
    label: 'LOGIC / PROCESSING',
    title: 'Middleware',
    detail: (data) => data.name || 'Request Hook',
    provider: (data) => data.provider || 'Express Middleware',
    icon: Cpu,
    color: '#7C3AED',
  },
  counterServiceNode: {
    label: 'LOGIC / PROCESSING',
    title: 'ID Generator',
    detail: (data) => data.name || 'Auto-increment ID',
    provider: (data) => data.provider || 'Redis Counter',
    icon: Cpu,
    color: '#7C3AED',
  },
  dbNode: {
    label: 'DATABASE',
    title: 'Database',
    detail: (data) => data.dbName || 'User Records',
    provider: (data) => data.type || 'Amazon DynamoDB',
    icon: Database,
    color: '#16A34A',
  },
  replicaNode: {
    label: 'DATABASE',
    title: 'Read Replica',
    detail: (data) => data.dbName || 'Read Mirror',
    provider: (data) => data.type || 'Amazon DynamoDB Replica',
    icon: Database,
    color: '#16A34A',
  },
  entityNode: {
    label: 'DATABASE',
    title: 'Data Model',
    detail: (data) => data.name || 'Entity Schema',
    provider: (data) => data.fields?.length ? `${data.fields.length} Fields Defined` : 'Empty Schema',
    icon: Database,
    color: '#16A34A',
  },
  storageNode: {
    label: 'STORAGE',
    title: 'File Storage',
    detail: (data) => data.bucketName || 'Upload Assets',
    provider: (data) => data.provider || 'Amazon S3',
    icon: HardDrive,
    color: '#0891B2',
  },
  cacheNode: {
    label: 'STORAGE',
    title: 'Cache Layer',
    detail: (data) => data.strategy || 'Cache-Aside',
    provider: (data) => data.provider || 'Redis Cache',
    icon: Zap,
    color: '#0891B2',
  },
  queueNode: {
    label: 'ASYNC / QUEUE',
    title: 'Async Jobs Queue',
    detail: (data) => data.topic || 'Email Queue',
    provider: (data) => data.broker || 'Amazon SQS',
    icon: GitCommit,
    color: '#EA580C',
  },
  cronNode: {
    label: 'ASYNC / QUEUE',
    title: 'Scheduler',
    detail: (data) => data.schedule || 'Cron Job',
    provider: (data) => data.description || 'Amazon EventBridge',
    icon: Clock,
    color: '#EA580C',
  },
  mailNode: {
    label: 'EXTERNAL SERVICE',
    title: 'SMTP Service',
    detail: (data) => data.description || 'Send Email',
    provider: (data) => data.fromEmail || 'noreply@app.com',
    icon: Mail,
    color: '#475569',
  },
  webhookNode: {
    label: 'EXTERNAL SERVICE',
    title: 'Webhook',
    detail: (data) => data.url || 'Webhook Callback',
    provider: (data) => data.description || 'External API Callback',
    icon: Webhook,
    color: '#475569',
  },
};

/* ── Partition ReactFlow Handles from content ──────────────────────────────── */
function partitionChildren(children) {
  const handles = [], content = [];
  React.Children.forEach(children, child => {
    if (!child) return;
    const isHandle =
      child.type?.displayName === 'Handle' ||
      child.type?.name === 'Handle' ||
      child.props?.position !== undefined;
    (isHandle ? handles : content).push(child);
  });
  return { content, handles };
}

/* ── Status dot ────────────────────────────────────────────────────────────── */
function StatusDot({ status }) {
  return <span className={`status-dot ${status}`} title={`Config: ${status}`} />;
}

/* ── Shape / config compatibility exports ──────────────────────────────────── */
const ACCENT = {
  slate:   { border: '#94a3b8', ring: 'rgba(148,163,184,0.4)', header: '#334155', glow: '148,163,184', text: '#94a3b8', bg: 'rgba(148,163,184,0.08)' },
  emerald: { border: '#10b981', ring: 'rgba(16,185,129,0.4)',  header: '#065f46', glow: '16,185,129',  text: '#34d399', bg: 'rgba(16,185,129,0.08)' },
  indigo:  { border: '#6366f1', ring: 'rgba(99,102,241,0.4)',  header: '#3730a3', glow: '99,102,241',  text: '#818cf8', bg: 'rgba(99,102,241,0.08)' },
  cyan:    { border: '#06b6d4', ring: 'rgba(6,182,212,0.4)',   header: '#155e75', glow: '6,182,212',   text: '#22d3ee', bg: 'rgba(6,182,212,0.08)' },
  violet:  { border: '#8b5cf6', ring: 'rgba(139,92,246,0.4)',  header: '#5b21b6', glow: '139,92,246',  text: '#a78bfa', bg: 'rgba(139,92,246,0.08)' },
  sky:     { border: '#0ea5e9', ring: 'rgba(14,165,233,0.4)',  header: '#075985', glow: '14,165,233',  text: '#38bdf8', bg: 'rgba(14,165,233,0.08)' },
  amber:   { border: '#f59e0b', ring: 'rgba(245,158,11,0.4)',  header: '#92400e', glow: '245,158,11',  text: '#fbbf24', bg: 'rgba(245,158,11,0.08)' },
  orange:  { border: '#f97316', ring: 'rgba(249,115,22,0.4)',  header: '#9a3412', glow: '249,115,22',  text: '#fb923c', bg: 'rgba(249,115,22,0.08)' },
  purple:  { border: '#a855f7', ring: 'rgba(168,85,247,0.4)',  header: '#6b21a8', glow: '168,85,247',  text: '#c084fc', bg: 'rgba(168,85,247,0.08)' },
  fuchsia: { border: '#d946ef', ring: 'rgba(217,70,239,0.4)',  header: '#86198f', glow: '217,70,239',  text: '#f472b6', bg: 'rgba(217,70,239,0.08)' },
  rose:    { border: '#f43f5e', ring: 'rgba(244,63,94,0.4)',   header: '#9f1239', glow: '244,63,94',   text: '#fca5a5', bg: 'rgba(244,63,94,0.08)' },
  blue:    { border: '#3b82f6', ring: 'rgba(59,130,246,0.4)',  header: '#1e40af', glow: '59,130,246',  text: '#60a5fa', bg: 'rgba(59,130,246,0.08)' },
  red:     { border: '#ef4444', ring: 'rgba(239,68,68,0.4)',   header: '#991b1b', glow: '239,68,68',   text: '#f87171', bg: 'rgba(239,68,68,0.08)' },
};
function getAccent(t) { return ACCENT[NODE_SHAPE_CONFIG[t]?.accentClass] ?? ACCENT.slate; }
function getShape(t)  { return NODE_SHAPE_CONFIG[t]?.shape ?? 'rect'; }
function getTechIcon(t) { return NODE_SHAPE_CONFIG[t]?.techIcon ?? null; }

/* ── Main card renderer ────────────────────────────────────────────────────── */
export default function ShapeWrapper({ nodeType, selected, children, data }) {
  const config = CATEGORY_MAP[nodeType] || CATEGORY_MAP.apiNode;
  const { handles } = partitionChildren(children);

  const IconComponent = config.icon;
  const detailText = typeof config.detail === 'function' ? config.detail(data) : config.detail;
  const providerText = typeof config.provider === 'function' ? config.provider(data) : config.provider;
  // ShapeWrapper renders its own card from CATEGORY_MAP and ignores the
  // per-node component's children (only Handles get through partitionChildren),
  // so a node's code line-count badge has to live here to actually be visible.
  // Guarded to logicNode / Custom middlewareNode so switching a middleware
  // node away from "Custom" doesn't keep showing a stale code badge.
  const showsCode = nodeType === 'logicNode' || (nodeType === 'middlewareNode' && data?.middlewareType === 'Custom');
  const codeLineCount = showsCode && data?.code?.trim() ? data.code.trim().split('\n').length : 0;

  // Determine completeness status
  const status = (() => {
    if (!data) return 'empty';
    const hasRequired = (() => {
      if (nodeType === 'entityNode') return data.fields?.length > 0;
      if (nodeType === 'apiNode')    return data.route && data.route !== '/new-api';
      if (nodeType === 'dbNode')     return data.uri && data.uri.length > 0;
      if (nodeType === 'authNode')   return data.secret && data.secret.length > 0;
      return true;
    })();
    const hasDescription = data?.description?.length > 0;
    if (hasRequired && hasDescription) return 'complete';
    if (hasRequired) return 'partial';
    return 'empty';
  })();

  return (
    <div
      className={`node-shape-root node-glass ${selected ? 'node-selected' : ''}`}
      style={{
        background: 'var(--bg-surface)',
        border: `1.5px solid ${selected ? config.color : 'var(--border-main)'}`,
        borderRadius: '12px',
        width: 250,
        boxShadow: selected
          ? `0 0 0 4px ${config.color}25, 0 12px 28px rgba(0,0,0,0.12)`
          : '0 4px 12px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.02)',
        transition: 'all 0.15s ease',
        position: 'relative',
      }}
    >
      {/* Complete status indicator */}
      <StatusDot status={status} />

      <div className="flex gap-3.5 p-3.5 items-center">
        {/* Category Icon Box */}
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
          style={{ backgroundColor: config.color }}
        >
          <IconComponent size={24} strokeWidth={2} />
        </div>

        {/* Text details */}
        <div className="flex-1 flex flex-col min-w-0 leading-tight">
          <span 
            className="text-[9px] font-bold tracking-wider uppercase"
            style={{ color: config.color }}
          >
            {config.label}
          </span>
          <h4 className="text-sm font-bold text-[var(--text-main)] mt-0.5 truncate">
            {config.title}
          </h4>
          <span 
            className="text-[11px] font-semibold mt-1 truncate"
            style={{ color: config.color }}
          >
            {detailText}
          </span>
          <span className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate font-medium">
            {providerText}
          </span>
          {codeLineCount > 0 && (
            <span className="text-[9px] font-mono font-bold text-emerald-500 bg-emerald-500/10 rounded px-1.5 py-0.5 mt-1 self-start">
              ⚡ {codeLineCount} {codeLineCount === 1 ? 'line' : 'lines'}
            </span>
          )}
        </div>
      </div>

      {handles}
    </div>
  );
}

export { getAccent, getShape, getTechIcon };

