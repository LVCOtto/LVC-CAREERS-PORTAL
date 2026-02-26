import { createContext, useContext, ReactNode } from 'react';
import { useCareerNodes } from './hooks';

export interface CareerNode {
  id: string;
  title: string;
  description: string;
  department: string;
  level: number;
  requirements: {
    certificateId?: string;
    competencyId?: string;
    description: string;
  }[];
  nextSteps: string[];
}

interface CareerPathContextType {
  nodes: CareerNode[];
  getNode: (id: string) => CareerNode | undefined;
  getCareerPath: (startNodeId: string) => CareerNode[];
}

const CareerPathContext = createContext<CareerPathContextType | undefined>(undefined);

export function CareerPathProvider({ children }: { children: ReactNode }) {
  const { data: dbNodes = [] } = useCareerNodes();

  const nodes: CareerNode[] = dbNodes.map((n: any) => ({
    id: n.slug || String(n.id),
    title: n.title,
    description: n.description || '',
    department: n.department || '',
    level: n.level || 1,
    requirements: Array.isArray(n.requirements) ? n.requirements : [],
    nextSteps: Array.isArray(n.nextSteps) ? n.nextSteps : [],
  }));

  const getNode = (id: string) => nodes.find(n => n.id === id);

  const getCareerPath = (startNodeId: string): CareerNode[] => {
    const visited = new Set<string>();
    const queue = [startNodeId];
    const path: CareerNode[] = [];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const node = getNode(currentId);
      if (node) {
        path.push(node);
        queue.push(...node.nextSteps);
      }
    }
    
    return path.sort((a, b) => a.level - b.level);
  };

  return (
    <CareerPathContext.Provider value={{ nodes, getNode, getCareerPath }}>
      {children}
    </CareerPathContext.Provider>
  );
}

export function useCareerPath() {
  const context = useContext(CareerPathContext);
  if (context === undefined) {
    throw new Error('useCareerPath must be used within a CareerPathProvider');
  }
  return context;
}
