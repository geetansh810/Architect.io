import { Handle, Position } from '@xyflow/react';
import { Users, Shield, Cpu, Database, Cloud, Box } from 'lucide-react';

const ZONE_COLORS = {
  blue:    { bg: 'rgba(59,130,246,0.03)',   border: '#3b82f6', title: '#60a5fa' },
  green:   { bg: 'rgba(16,185,129,0.03)',   border: '#10b981', title: '#34d399' },
  purple:  { bg: 'rgba(139,92,246,0.03)',   border: '#8b5cf6', title: '#a78bfa' },
  orange:  { bg: 'rgba(249,115,22,0.03)',   border: '#f97316', title: '#fb923c' },
  red:     { bg: 'rgba(239,68,68,0.03)',    border: '#ef4444', title: '#f87171' },
  slate:   { bg: 'rgba(100,116,139,0.03)',  border: '#64748b', title: '#94a3b8' },
};

function getZoneIcon(label = '') {
  const lowercaseLabel = label.toLowerCase();
  if (lowercaseLabel.includes('client')) return Users;
  if (lowercaseLabel.includes('edge')) return Shield;
  if (lowercaseLabel.includes('microservice') || lowercaseLabel.includes('service')) return Cpu;
  if (lowercaseLabel.includes('data') || lowercaseLabel.includes('db') || lowercaseLabel.includes('store')) return Database;
  if (lowercaseLabel.includes('external') || lowercaseLabel.includes('async')) return Cloud;
  return Box;
}

export default function ZoneGroup({ data, selected }) {
  const palette = ZONE_COLORS[data.color || 'blue'];
  const IconComponent = getZoneIcon(data.label);

  return (
    <div
      className="zone-group-node"
      style={{
        background: palette.bg,
        borderColor: selected ? palette.border : `${palette.border}55`,
        minWidth: data.width || 320,
        minHeight: data.height || 220,
        position: 'relative',
        pointerEvents: 'all',
        borderWidth: '1.5px',
        borderStyle: 'solid',
        borderRadius: '12px',
      }}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 select-none">
        <IconComponent size={14} style={{ color: palette.border }} />
        <span className="font-black text-xs tracking-wider uppercase text-[var(--text-main)]">
          {data.label || 'Zone'}
        </span>
        {data.description && (
          <span className="text-[9px] text-[var(--text-muted)] ml-auto font-bold uppercase tracking-wider">{data.description}</span>
        )}
      </div>

      {/* Drop hint */}
      {!data.hasChildren && (
        <div className="absolute inset-0 flex items-center justify-center top-10 pointer-events-none">
          <p className="text-[9px] text-[var(--text-muted)] opacity-30 font-black uppercase tracking-widest">
            Drop components inside
          </p>
        </div>
      )}

      <Handle type="target" position={Position.Left}   className="!bg-gray-400 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right}  className="!bg-gray-400 !border-[var(--bg-surface)]" />
    </div>
  );
}
