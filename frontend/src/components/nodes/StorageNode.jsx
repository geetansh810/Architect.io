import { Handle, Position } from '@xyflow/react';
import { Upload } from 'lucide-react';
import ShapeWrapper from './ShapeWrapper';

export default function StorageNode({ data, selected }) {
  return (
    <ShapeWrapper nodeType="storageNode" selected={selected}>
      {/* Centered cloud contents */}
      <div className="p-1.5 rounded-full bg-orange-500/10 border border-orange-500/25 mb-1 shadow-sm">
        <Upload className="w-5 h-5 text-orange-400" />
      </div>

      <h4 className="font-black text-[var(--text-main)] text-xs tracking-wide">
        File Upload
      </h4>
      
      <p className="text-[10px] font-semibold text-orange-400 max-w-[120px] truncate leading-tight mt-0.5">
        {data.provider || 'Local (Multer)'}
      </p>

      {data.maxSizeMB && (
        <span className="text-[8px] font-bold text-[var(--text-muted)] mt-1.5 opacity-80">
          Max: {data.maxSizeMB}MB
        </span>
      )}

      <Handle type="target" position={Position.Left} className="!bg-orange-500 !w-3 !h-3 !border-2 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right} className="!bg-orange-500 !w-3 !h-3 !border-2 !border-[var(--bg-surface)]" />
    </ShapeWrapper>
  );
}
