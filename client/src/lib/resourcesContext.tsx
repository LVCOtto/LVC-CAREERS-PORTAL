import { createContext, useContext, useState, ReactNode } from 'react';
import { Resource, resources as initialResources } from './mockData';
import { v4 as uuidv4 } from 'uuid';

interface ResourcesContextType {
  resources: Resource[];
  addResource: (resource: Omit<Resource, 'id'>) => void;
  updateResource: (id: string, resource: Partial<Resource>) => void;
  deleteResource: (id: string) => void;
}

const ResourcesContext = createContext<ResourcesContextType | undefined>(undefined);

export function ResourcesProvider({ children }: { children: ReactNode }) {
  const [resources, setResources] = useState<Resource[]>(initialResources);

  const addResource = (resource: Omit<Resource, 'id'>) => {
    const newResource = {
      ...resource,
      id: `res-${Date.now()}`, // Simple ID generation
    };
    setResources([...resources, newResource]);
  };

  const updateResource = (id: string, updates: Partial<Resource>) => {
    setResources(resources.map(r => (r.id === id ? { ...r, ...updates } : r)));
  };

  const deleteResource = (id: string) => {
    setResources(resources.filter(r => r.id !== id));
  };

  return (
    <ResourcesContext.Provider value={{ resources, addResource, updateResource, deleteResource }}>
      {children}
    </ResourcesContext.Provider>
  );
}

export function useResources() {
  const context = useContext(ResourcesContext);
  if (context === undefined) {
    throw new Error('useResources must be used within a ResourcesProvider');
  }
  return context;
}
