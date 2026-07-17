import { useState, useRef, useEffect, useCallback } from 'react';
import { NodeResizer } from '@xyflow/react';
import { useArchitecture } from '../../context/ArchitectureContext';

// ── Colour Palette ────────────────────────────────────────────────────────────
export const CATEGORY_BOX_COLORS = {
  blue:   { bg: 'rgba(59,130,246,0.08)',   border: 'rgba(59,130,246,0.45)',   title: '#60a5fa', dot: '#3b82f6' },
  purple: { bg: 'rgba(139,92,246,0.08)',   border: 'rgba(139,92,246,0.45)',   title: '#a78bfa', dot: '#8b5cf6' },
  green:  { bg: 'rgba(16,185,129,0.08)',   border: 'rgba(16,185,129,0.45)',   title: '#34d399', dot: '#10b981' },
  orange: { bg: 'rgba(249,115,22,0.08)',   border: 'rgba(249,115,22,0.45)',   title: '#fb923c', dot: '#f97316' },
  red:    { bg: 'rgba(239,68,68,0.08)',    border: 'rgba(239,68,68,0.45)',    title: '#f87171', dot: '#ef4444' },
  slate:  { bg: 'rgba(100,116,139,0.08)', border: 'rgba(100,116,139,0.45)', title: '#94a3b8', dot: '#64748b' },
  cyan:   { bg: 'rgba(6,182,212,0.08)',   border: 'rgba(6,182,212,0.45)',   title: '#22d3ee', dot: '#06b6d4' },
  amber:  { bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.45)',  title: '#fbbf24', dot: '#f59e0b' },
};

const COLOR_KEYS = Object.keys(CATEGORY_BOX_COLORS);

// ── CategoryBox Node ──────────────────────────────────────────────────────────
export default function CategoryBox({ id, data, selected }) {
  const { updateNodeData } = useArchitecture();
  const [editingTitle, setEditingTitle] = useState(false);
  const titleRef = useRef(null);

  const palette = CATEGORY_BOX_COLORS[data.color || 'blue'];

  // Focus title input when editing starts
  useEffect(() => {
    if (editingTitle && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [editingTitle]);

  const handleColorChange = useCallback((e, color) => {
    e.stopPropagation();
    updateNodeData(id, { color });
  }, [id, updateNodeData]);

  const handleTitleChange = useCallback((e) => {
    updateNodeData(id, { title: e.target.value });
  }, [id, updateNodeData]);

  const handleTitleBlur = useCallback(() => {
    setEditingTitle(false);
  }, []);

  const handleTitleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      setEditingTitle(false);
    }
  }, []);

  const width  = data.width  || 400;
  const height = data.height || 250;

  return (
    <>
      {/* ── Resize handles (only visible when selected) ── */}
      <NodeResizer
        isVisible={selected}
        minWidth={200}
        minHeight={120}
        handleStyle={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: palette.dot,
          border: `2px solid white`,
          boxShadow: `0 0 0 3px ${palette.border}`,
        }}
        lineStyle={{
          borderColor: palette.border,
          borderWidth: 1.5,
        }}
        onResize={(_, params) => {
          updateNodeData(id, {
            width: Math.round(params.width),
            height: Math.round(params.height),
          });
        }}
      />

      {/* ── Box surface ── */}
      <div
        className="category-box-node"
        style={{
          background: palette.bg,
          borderColor: selected ? palette.dot : palette.border,
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          width,
          height,
          boxShadow: selected
            ? `0 0 0 1.5px ${palette.dot}, 0 8px 32px rgba(0,0,0,0.12)`
            : `0 2px 16px rgba(0,0,0,0.06)`,
        }}
      >
        {/* ── Title bar ── */}
        <div
          className="category-box-title-bar"
          style={{ borderBottomColor: selected ? palette.dot : palette.border }}
        >
          {/* Colour dot picker */}
          <div className="category-box-color-dots">
            {COLOR_KEYS.map((c) => (
              <button
                key={c}
                title={c}
                onMouseDown={(e) => handleColorChange(e, c)}
                className="category-box-color-dot"
                style={{
                  background: CATEGORY_BOX_COLORS[c].dot,
                  outline: data.color === c ? `2px solid ${CATEGORY_BOX_COLORS[c].dot}` : 'none',
                  outlineOffset: '2px',
                  transform: data.color === c ? 'scale(1.2)' : 'scale(1)',
                }}
              />
            ))}
          </div>

          {/* Editable title */}
          {editingTitle ? (
            <input
              ref={titleRef}
              value={data.title || 'Category'}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="category-box-title-input"
              style={{ color: palette.title }}
            />
          ) : (
            <span
              className="category-box-title-text"
              style={{ color: palette.title }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setEditingTitle(true);
              }}
              title="Double-click to rename"
            >
              {data.title || 'Category'}
            </span>
          )}
        </div>

        {/* ── Drop hint when empty ── */}
        <div className="category-box-hint">
          <span style={{ color: palette.title }}>
            Drop nodes here
          </span>
        </div>
      </div>
    </>
  );
}
