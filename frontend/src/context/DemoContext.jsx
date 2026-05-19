import { createContext, useContext, useState, useCallback } from 'react';

const DemoContext = createContext(null);

// ─── Default Demo Architecture ─────────────────────────────────────────────
// Uses actual registered node types from Builder.jsx nodeTypes map
export const DEFAULT_DEMO_NODES = [
  {
    id: 'demo-cdn',
    type: 'cdnNode',
    position: { x: 400, y: 40 },
    data: { provider: 'CloudFront CDN', redirectType: 'HTTP 302', regions: 'Global', label: 'CloudFront CDN', deletable: true },
  },
  {
    id: 'demo-lb',
    type: 'loadBalancerNode',
    position: { x: 400, y: 200 },
    data: { algorithm: 'Round Robin', healthPath: '/health', intervalSec: 30, sslTermination: true, label: 'API Gateway / LB', deletable: true },
  },
  {
    id: 'demo-auth',
    type: 'authNode',
    position: { x: 140, y: 400 },
    data: { method: 'JWT', expiry: '24h', secret: 'demo-secret', label: 'Auth Service', deletable: true },
  },
  {
    id: 'demo-api',
    type: 'apiNode',
    position: { x: 460, y: 400 },
    data: { route: '/api/v1', authEnabled: true, label: 'Express API Server', deletable: true },
  },
  {
    id: 'demo-mongo',
    type: 'dbNode',
    position: { x: 220, y: 600 },
    data: { type: 'mongodb', dbName: 'mern_app', uri: 'mongodb+srv://...', label: 'MongoDB Atlas', deletable: true },
  },
  {
    id: 'demo-redis',
    type: 'cacheNode',
    position: { x: 520, y: 600 },
    data: { provider: 'Redis', evictionPolicy: 'LRU', ttl: 3600, strategy: 'Cache-Aside', label: 'Redis Cache', deletable: true },
  },
  {
    id: 'demo-queue',
    type: 'queueNode',
    position: { x: 780, y: 400 },
    data: { broker: 'SQS', topic: 'job-queue', consumerGroup: 'worker-service', partitions: 3, label: 'SQS Job Queue', deletable: true },
  },
  {
    id: 'demo-worker',
    type: 'logicNode',
    position: { x: 780, y: 600 },
    data: { name: 'Background Worker', hook: 'after-create', label: 'Background Worker', deletable: true },
  },
];

export const DEFAULT_DEMO_EDGES = [
  { id: 'de1', source: 'demo-cdn', target: 'demo-lb', animated: true },
  { id: 'de2', source: 'demo-lb', target: 'demo-auth' },
  { id: 'de3', source: 'demo-lb', target: 'demo-api' },
  { id: 'de4', source: 'demo-auth', target: 'demo-mongo' },
  { id: 'de5', source: 'demo-api', target: 'demo-mongo' },
  { id: 'de6', source: 'demo-api', target: 'demo-redis' },
  { id: 'de7', source: 'demo-api', target: 'demo-queue' },
  { id: 'de8', source: 'demo-queue', target: 'demo-worker' },
];

export function DemoProvider({ children }) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoNodes, setDemoNodes] = useState(DEFAULT_DEMO_NODES);
  const [demoEdges, setDemoEdges] = useState(DEFAULT_DEMO_EDGES);
  const [demoProjectName, setDemoProjectName] = useState('Demo: MERN Stack App');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [resetCounter, setResetCounter] = useState(0);

  const enterDemoMode = useCallback(() => {
    setDemoNodes(DEFAULT_DEMO_NODES);
    setDemoEdges(DEFAULT_DEMO_EDGES);
    setDemoProjectName('Demo: MERN Stack App');
    setHasUnsavedChanges(false);
    setIsDemoMode(true);
    sessionStorage.setItem('architect_demo_mode', 'true');
  }, []);

  const exitDemoMode = useCallback(() => {
    setIsDemoMode(false);
    sessionStorage.removeItem('architect_demo_mode');
  }, []);

  const updateDemoNodes = useCallback((nodes) => {
    setDemoNodes(nodes);
    setHasUnsavedChanges(true);
  }, []);

  const updateDemoEdges = useCallback((edges) => {
    setDemoEdges(edges);
    setHasUnsavedChanges(true);
  }, []);

  const resetDemo = useCallback(() => {
    setDemoNodes(DEFAULT_DEMO_NODES);
    setDemoEdges(DEFAULT_DEMO_EDGES);
    setHasUnsavedChanges(false);
    setResetCounter((prev) => prev + 1);
  }, []);

  return (
    <DemoContext.Provider value={{
      isDemoMode,
      demoNodes,
      demoEdges,
      demoProjectName,
      hasUnsavedChanges,
      resetCounter,
      enterDemoMode,
      exitDemoMode,
      updateDemoNodes,
      updateDemoEdges,
      resetDemo,
      setDemoProjectName,
    }}>
      {children}
    </DemoContext.Provider>
  );
}

export const useDemo = () => {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used within DemoProvider');
  return ctx;
};
