import { NodeToolbar, useReactFlow } from '@xyflow/react';
import { Trash2 } from 'lucide-react';

export default function NodeToolbarWrapper({ id, selected, data, children }) {
  const { deleteElements } = useReactFlow();

  const handleDelete = () => {
    if (data?.deletable !== false) {
      deleteElements({ nodes: [{ id }] });
    }
  };

  if (data?.deletable === false) {
    return <>{children}</>;
  }

  return (
    <>
      <NodeToolbar isVisible={selected} position="top">
        <button
          onClick={handleDelete}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
        >
          <Trash2 size={12} />
          Delete
        </button>
      </NodeToolbar>
      {children}
    </>
  );
}
