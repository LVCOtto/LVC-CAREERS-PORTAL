import { createContext, useContext, useState, ReactNode } from 'react';
import { CertificateDefinition, useCertificates } from './certificatesContext';

export interface CareerNode {
  id: string;
  title: string;
  description: string;
  department: string;
  level: number;
  requirements: {
    certificateId?: string; // Links to CertificateDefinition.id
    competencyId?: string; // Future: Link to competency
    description: string;
  }[];
  nextSteps: string[]; // IDs of nodes this leads to
}

// Initial mock data defining a simple career tree
const initialCareerNodes: CareerNode[] = [
  // Engineering Path
  {
    id: 'trainee-engineer',
    title: 'Trainee Engineer',
    description: 'Entry level role focusing on learning core equipment and safety.',
    department: 'Engineering',
    level: 1,
    requirements: [],
    nextSteps: ['field-service-engineer']
  },
  {
    id: 'field-service-engineer',
    title: 'Field Service Engineer',
    description: 'Independent role managing own van stock and customer visits.',
    department: 'Engineering',
    level: 2,
    requirements: [
      { certificateId: 'def-5', description: 'Pressure Washer Operations' },
      { certificateId: 'def-7', description: 'Health & Safety First (Gold)' }
    ],
    nextSteps: ['senior-engineer', 'specialist-technician']
  },
  {
    id: 'senior-engineer',
    title: 'Senior Service Engineer',
    description: 'Experienced engineer handling complex repairs and mentoring juniors.',
    department: 'Engineering',
    level: 3,
    requirements: [
      { certificateId: 'def-1', description: 'Scrubber Dryer Technician (Silver)' },
      { certificateId: 'def-4', description: 'Equipment Diagnostics' }
    ],
    nextSteps: ['workshop-manager', 'engineering-lead']
  },
  {
    id: 'specialist-technician',
    title: 'Specialist Technician',
    description: 'Subject matter expert in specific complex machinery types.',
    department: 'Engineering',
    level: 3,
    requirements: [
      { certificateId: 'def-3', description: 'Industrial Floor Care (Bronze)' }
    ],
    nextSteps: ['engineering-lead']
  },
  {
    id: 'engineering-lead',
    title: 'Engineering Team Lead',
    description: 'Leadership role managing a team of engineers and KPIs.',
    department: 'Engineering',
    level: 4,
    requirements: [
      { certificateId: 'def-6', description: 'Team Leadership (Silver)' },
      { certificateId: 'def-2', description: 'Customer Service Excellence (Gold)' }
    ],
    nextSteps: ['operations-manager']
  },
  {
    id: 'workshop-manager',
    title: 'Workshop Manager',
    description: 'Responsible for workshop operations, logistics and safety.',
    department: 'Engineering',
    level: 4,
    requirements: [
      { certificateId: 'def-6', description: 'Team Leadership' }
    ],
    nextSteps: ['operations-manager']
  },
  
  // Cross-functional endpoint
  {
    id: 'operations-manager',
    title: 'Operations Manager',
    description: 'Senior leadership role overseeing multiple departments.',
    department: 'Operations',
    level: 5,
    requirements: [
        { description: '5+ years experience' }
    ],
    nextSteps: []
  }
];

interface CareerPathContextType {
  nodes: CareerNode[];
  getNode: (id: string) => CareerNode | undefined;
  getCareerPath: (startNodeId: string) => CareerNode[];
}

const CareerPathContext = createContext<CareerPathContextType | undefined>(undefined);

export function CareerPathProvider({ children }: { children: ReactNode }) {
  const [nodes] = useState<CareerNode[]>(initialCareerNodes);

  const getNode = (id: string) => nodes.find(n => n.id === id);

  // Simple BFS to find all connected nodes downstream
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
    
    // Sort by level for simpler timeline visualization
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
