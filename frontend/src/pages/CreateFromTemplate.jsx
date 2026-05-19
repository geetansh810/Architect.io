import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api.js';

export function CreateFromTemplate() {
  const navigate = useNavigate();

  useEffect(() => {
    const createProject = async () => {
      const templateData = sessionStorage.getItem('architect_load_template');
      if (!templateData) {
        navigate('/dashboard');
        return;
      }

      try {
        const template = JSON.parse(templateData);
        sessionStorage.removeItem('architect_load_template');

        // Call backend API to create a new workflow
        const response = await api('/workflows', {
          method: 'POST',
          body: JSON.stringify({
            name: `${template.name} Project`,
            architecture_json: {
              nodes: template.nodes,
              edges: template.edges,
              documentation: template.documentation || `# ${template.name}\n\n${template.description || ''}`,
              database: 'mongodb'
            }
          })
        });

        if (!response.ok) {
          throw new Error('Failed to create project from template');
        }

        const data = await response.json();
        navigate(`/workflow/${data.id}`);
      } catch (error) {
        console.error('Error creating workflow from template:', error);
        navigate('/dashboard');
      }
    };

    createProject();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex flex-col items-center justify-center text-[var(--text-main)] transition-colors duration-300">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500 mb-4"></div>
      <p className="text-sm text-[var(--text-muted)] font-medium">Creating project from template...</p>
    </div>
  );
}

export default CreateFromTemplate;
