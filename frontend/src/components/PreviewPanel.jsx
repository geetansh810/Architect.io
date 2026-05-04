import { useState, useEffect } from 'react';
import { Terminal, Code, Server, Play } from 'lucide-react';
import { useArchitecture } from '../context/ArchitectureContext';

export default function PreviewPanel() {
  const { parseToBackendPayload, nodes, edges } = useArchitecture();
  const [activeTab, setActiveTab] = useState('api'); // 'api' | 'code'
  const [codePreview, setCodePreview] = useState({});
  const [selectedFile, setSelectedFile] = useState('');
  const [loading, setLoading] = useState(false);

  // Derive entities and apis for preview
  const payload = parseToBackendPayload();
  const entities = payload.entities;
  const apis = payload.apis;

  useEffect(() => {
    if (activeTab === 'code' && entities.length > 0) {
      fetchCodePreview();
    }
  }, [nodes, edges, activeTab]);

  const fetchCodePreview = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/generate/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setCodePreview(data);
      if (!selectedFile || !data[selectedFile]) {
        setSelectedFile(Object.keys(data)[0] || '');
      }
    } catch (err) {
      console.error('Preview error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-dark-border bg-dark-surface sticky top-0">
        <button
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'api' ? 'text-brand-400 border-b-2 border-brand-500 bg-dark-bg/50' : 'text-slate-400 hover:text-slate-200'}`}
          onClick={() => setActiveTab('api')}
        >
          <Server className="w-4 h-4" /> Live API
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'code' ? 'text-brand-400 border-b-2 border-brand-500 bg-dark-bg/50' : 'text-slate-400 hover:text-slate-200'}`}
          onClick={() => setActiveTab('code')}
        >
          <Code className="w-4 h-4" /> Code
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'api' ? (
          <ApiPreview apis={apis} entities={entities} />
        ) : (
          <CodePreview 
            files={codePreview} 
            selectedFile={selectedFile} 
            setSelectedFile={setSelectedFile}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}

function ApiPreview({ apis, entities }) {
  if (apis.length === 0) {
    return <div className="text-center text-slate-500 mt-10">No APIs to preview yet.</div>;
  }

  return (
    <div className="space-y-6">
      {apis.map(api => {
        const entity = entities.find(e => e.name === api.entityName);
        if (!entity) return null;

        const dummyBody = entity.fields.reduce((acc, f) => {
          acc[f.name] = f.type === 'string' ? 'string' : f.type === 'number' ? 0 : f.type === 'boolean' ? true : '2023-01-01';
          return acc;
        }, {});

        return (
          <div key={api.entityName} className="space-y-3">
            <h4 className="font-bold text-slate-200">{api.entityName} API</h4>
            <div className="bg-[#161b22] border border-dark-border rounded-lg overflow-hidden font-mono text-xs">
              <div className="px-4 py-2 border-b border-dark-border flex items-center gap-3">
                <span className="text-green-400 font-bold w-12">GET</span>
                <span className="text-slate-300">{api.route}</span>
              </div>
              <div className="px-4 py-2 border-b border-dark-border flex items-center gap-3">
                <span className="text-green-400 font-bold w-12">GET</span>
                <span className="text-slate-300">{api.route}/:id</span>
              </div>
              <div className="px-4 py-2 border-b border-dark-border">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-yellow-400 font-bold w-12">POST</span>
                  <span className="text-slate-300">{api.route}</span>
                </div>
                <div className="pl-15 text-slate-500">
                  Body: <br/>
                  <pre className="text-slate-400 mt-1">{JSON.stringify(dummyBody, null, 2)}</pre>
                </div>
              </div>
              <div className="px-4 py-2 border-b border-dark-border flex items-center gap-3">
                <span className="text-blue-400 font-bold w-12">PUT</span>
                <span className="text-slate-300">{api.route}/:id</span>
              </div>
              <div className="px-4 py-2 flex items-center gap-3">
                <span className="text-red-400 font-bold w-12">DELETE</span>
                <span className="text-slate-300">{api.route}/:id</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CodePreview({ files, selectedFile, setSelectedFile, loading }) {
  const fileNames = Object.keys(files);

  if (loading && fileNames.length === 0) return <div className="text-slate-500">Loading code...</div>;
  if (fileNames.length === 0) return <div className="text-center text-slate-500 mt-10">Add entities to see code preview.</div>;

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap gap-2 mb-4">
        {fileNames.map(name => (
          <button
            key={name}
            onClick={() => setSelectedFile(name)}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${selectedFile === name ? 'bg-brand-600 text-white' : 'bg-dark-surface text-slate-400 hover:text-slate-200'}`}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="flex-1 bg-[#161b22] border border-dark-border rounded-lg p-4 overflow-auto">
        <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
          {files[selectedFile]}
        </pre>
      </div>
    </div>
  );
}
