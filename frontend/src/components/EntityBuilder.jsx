import { useState } from 'react';
import { Plus, Trash2, Database, KeySquare } from 'lucide-react';
import { useArchitecture } from '../context/ArchitectureContext';

export default function EntityBuilder() {
  const { entities, addEntity, removeEntity, addField, removeField } = useArchitecture();
  const [newEntityName, setNewEntityName] = useState('');

  const handleAddEntity = (e) => {
    e.preventDefault();
    if (!newEntityName.trim()) return;
    // Simple PascalCase formatter
    const formatted = newEntityName.trim().charAt(0).toUpperCase() + newEntityName.trim().slice(1);
    addEntity(formatted);
    setNewEntityName('');
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Database className="w-5 h-5 text-brand-500" />
        <h3 className="text-lg font-semibold text-slate-100">Entities</h3>
      </div>

      <form onSubmit={handleAddEntity} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newEntityName}
          onChange={(e) => setNewEntityName(e.target.value)}
          placeholder="e.g. User, Product"
          className="flex-1 bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 transition-colors text-white placeholder-slate-500"
        />
        <button
          type="submit"
          className="bg-brand-600 hover:bg-brand-500 text-white p-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      <div className="space-y-4">
        {entities.map(entity => (
          <EntityCard 
            key={entity.name} 
            entity={entity} 
            onRemove={() => removeEntity(entity.name)}
            onAddField={addField}
            onRemoveField={removeField}
          />
        ))}
        {entities.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-4">No entities defined.</p>
        )}
      </div>
    </div>
  );
}

function EntityCard({ entity, onRemove, onAddField, onRemoveField }) {
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('string');
  const [newFieldRequired, setNewFieldRequired] = useState(false);

  const handleAddField = (e) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;
    
    // CamelCase formatting for fields
    const formatted = newFieldName.trim().replace(/\s+/g, '').toLowerCase();
    if (entity.fields.some(f => f.name === formatted)) return;

    onAddField(entity.name, {
      name: formatted,
      type: newFieldType,
      required: newFieldRequired
    });
    setNewFieldName('');
  };

  return (
    <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
      <div className="bg-dark-border/30 px-4 py-3 flex items-center justify-between border-b border-dark-border">
        <h4 className="font-semibold text-brand-100 flex items-center gap-2">
          <KeySquare className="w-4 h-4 text-brand-500" />
          {entity.name}
        </h4>
        <button onClick={onRemove} className="text-slate-500 hover:text-red-400 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-4">
        <div className="space-y-2 mb-4">
          {entity.fields.map(field => (
            <div key={field.name} className="flex items-center justify-between text-sm bg-dark-bg/50 px-3 py-2 rounded-lg border border-dark-border/50">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-200">{field.name}</span>
                <span className="text-slate-500 text-xs px-1.5 py-0.5 rounded bg-dark-border">{field.type}</span>
                {field.required && <span className="text-red-400 text-xs font-medium">*</span>}
              </div>
              <button 
                onClick={() => onRemoveField(entity.name, field.name)}
                className="text-slate-500 hover:text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {entity.fields.length === 0 && (
            <div className="text-xs text-slate-500 text-center py-2">No fields added</div>
          )}
        </div>

        <form onSubmit={handleAddField} className="flex flex-col gap-2 mt-4 pt-4 border-t border-dark-border/50">
          <div className="flex gap-2">
            <input
              type="text"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              placeholder="Field name"
              className="w-1/2 bg-dark-bg border border-dark-border rounded px-2 py-1.5 text-xs text-white focus:border-brand-500 outline-none"
            />
            <select
              value={newFieldType}
              onChange={(e) => setNewFieldType(e.target.value)}
              className="w-1/2 bg-dark-bg border border-dark-border rounded px-2 py-1.5 text-xs text-white focus:border-brand-500 outline-none"
            >
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="date">Date</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={newFieldRequired}
                onChange={(e) => setNewFieldRequired(e.target.checked)}
                className="rounded border-dark-border bg-dark-bg text-brand-500 focus:ring-brand-500 focus:ring-offset-dark-surface"
              />
              Required
            </label>
            <button
              type="submit"
              className="text-xs bg-dark-border hover:bg-brand-600 hover:text-white text-slate-300 px-3 py-1.5 rounded transition-colors"
            >
              Add Field
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
