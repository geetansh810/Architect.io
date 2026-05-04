import { Link2, Shield, Trash2, Webhook } from 'lucide-react';
import { useArchitecture } from '../context/ArchitectureContext';

export default function ApiBuilder() {
  const { entities, apis, addApi, removeApi, toggleAuth } = useArchitecture();

  // Find entities that don't have an API yet
  const availableEntities = entities.filter(e => !apis.some(a => a.entityName === e.name));

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Webhook className="w-5 h-5 text-brand-500" />
        <h3 className="text-lg font-semibold text-slate-100">API Endpoints</h3>
      </div>

      {availableEntities.length > 0 && (
        <div className="mb-8">
          <label className="block text-sm text-slate-400 mb-2">Create API for Entity</label>
          <div className="flex flex-wrap gap-2">
            {availableEntities.map(entity => (
              <button
                key={entity.name}
                onClick={() => addApi(entity.name)}
                className="flex items-center gap-2 bg-dark-surface border border-dark-border hover:border-brand-500 text-sm px-3 py-1.5 rounded-lg transition-colors"
              >
                <Link2 className="w-4 h-4 text-slate-500" />
                {entity.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {apis.map(api => (
          <div key={api.entityName} className="bg-dark-surface border border-dark-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-brand-400 font-bold">CRUD</span>
                <span className="text-white font-medium">{api.route}</span>
              </div>
              <button 
                onClick={() => removeApi(api.entityName)}
                className="text-slate-500 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm bg-dark-bg/50 px-3 py-2 rounded-lg border border-dark-border/50">
                <span className="text-slate-400">Linked Entity</span>
                <span className="font-medium text-slate-200">{api.entityName}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm bg-dark-bg/50 px-3 py-2 rounded-lg border border-dark-border/50">
                <span className="flex items-center gap-2 text-slate-400">
                  <Shield className="w-4 h-4" /> Auth Required
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={api.authEnabled}
                    onChange={() => toggleAuth(api.entityName)}
                  />
                  <div className="w-9 h-5 bg-dark-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500"></div>
                </label>
              </div>
            </div>
          </div>
        ))}

        {apis.length === 0 && (
          <div className="text-center p-6 border border-dashed border-dark-border rounded-xl">
            <p className="text-sm text-slate-500">No APIs created.</p>
            {entities.length === 0 && (
              <p className="text-xs text-slate-600 mt-2">Create an entity first to link an API.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
