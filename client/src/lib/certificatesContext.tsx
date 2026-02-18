import { createContext, useContext, useState, ReactNode } from 'react';

export type CertificateCategory = 'Safety' | 'Technical' | 'Professional' | 'Compliance' | 'Leadership';
export type CertificateLevel = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Standard';

export interface CertificateDefinition {
  id: string;
  name: string;
  description: string;
  category: CertificateCategory;
  level: CertificateLevel;
  icon: string; // Icon name
  provider: string; // e.g., "LVC Training Academy"
  validityMonths?: number;
}

export interface UserCertificate {
  id: string;
  definitionId: string;
  userId: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  status: 'valid' | 'expiring_soon' | 'expired';
}

interface CertificatesContextType {
  definitions: CertificateDefinition[];
  userCertificates: UserCertificate[];
  addDefinition: (def: Omit<CertificateDefinition, 'id'>) => void;
  updateDefinition: (id: string, def: Partial<CertificateDefinition>) => void;
  deleteDefinition: (id: string) => void;
  assignCertificate: (cert: Omit<UserCertificate, 'id'>) => void;
  getUserCertificates: (userId: string) => (UserCertificate & { definition: CertificateDefinition })[];
}

const initialDefinitions: CertificateDefinition[] = [
  {
    id: 'def-1',
    name: 'Scrubber Dryer Technician',
    description: 'Qualified to service and repair commercial scrubber dryers',
    category: 'Technical',
    level: 'Silver',
    icon: 'wrench',
    provider: 'LVC Training Academy',
    validityMonths: 12
  },
  {
    id: 'def-2',
    name: 'Customer Service Excellence',
    description: 'Demonstrated exceptional customer handling skills',
    category: 'Professional',
    level: 'Gold',
    icon: 'heart-handshake',
    provider: 'LVC Training Academy'
  },
  {
    id: 'def-3',
    name: 'Industrial Floor Care',
    description: 'Specialist knowledge in industrial floor maintenance',
    category: 'Technical',
    level: 'Bronze',
    icon: 'layers',
    provider: 'British Institute of Cleaning Science'
  },
  {
    id: 'def-4',
    name: 'Equipment Diagnostics',
    description: 'Fundamental skills in diagnosing equipment faults',
    category: 'Technical',
    level: 'Standard',
    icon: 'stethoscope',
    provider: 'LVC Training Academy'
  },
  {
    id: 'def-5',
    name: 'Pressure Washer Operations',
    description: 'Safe operation and maintenance of pressure washers',
    category: 'Technical',
    level: 'Standard',
    icon: 'droplets',
    provider: 'LVC Training Academy',
    validityMonths: 12
  },
  {
    id: 'def-6',
    name: 'Team Leadership',
    description: 'ILM Level 3 Award in Leadership and Management',
    category: 'Leadership',
    level: 'Silver',
    icon: 'users',
    provider: 'ILM'
  },
  {
    id: 'def-7',
    name: 'Health & Safety First',
    description: 'Advanced understanding of workplace safety protocols',
    category: 'Safety',
    level: 'Gold',
    icon: 'shield-check',
    provider: 'LVC Training Academy',
    validityMonths: 12
  }
];

const initialUserCertificates: UserCertificate[] = [
  { id: 'uc-1', definitionId: 'def-1', userId: 'colleague-1', issueDate: '2025-01-05', status: 'valid', credentialId: 'LVC-SD2-2025-0012' },
  { id: 'uc-2', definitionId: 'def-2', userId: 'colleague-1', issueDate: '2024-12-10', status: 'valid', credentialId: 'LVC-CSE-2024-0089' },
  { id: 'uc-3', definitionId: 'def-3', userId: 'colleague-1', issueDate: '2024-11-15', status: 'valid', credentialId: 'BICS-IFC-2024-2281' },
  { id: 'uc-4', definitionId: 'def-4', userId: 'colleague-1', issueDate: '2024-10-20', status: 'valid', credentialId: 'LVC-EDF-2024-0044' },
  { id: 'uc-5', definitionId: 'def-5', userId: 'colleague-1', issueDate: '2024-06-15', expiryDate: '2025-01-15', status: 'expiring_soon', credentialId: 'LVC-PWO-2024-0021' },
  // Manager certs
  { id: 'uc-6', definitionId: 'def-6', userId: 'manager-1', issueDate: '2022-09-01', status: 'valid' },
  { id: 'uc-7', definitionId: 'def-4', userId: 'manager-1', issueDate: '2023-06-20', status: 'valid' },
];

const CertificatesContext = createContext<CertificatesContextType | undefined>(undefined);

export function CertificatesProvider({ children }: { children: ReactNode }) {
  const [definitions, setDefinitions] = useState<CertificateDefinition[]>(initialDefinitions);
  const [userCertificates, setUserCertificates] = useState<UserCertificate[]>(initialUserCertificates);

  const addDefinition = (def: Omit<CertificateDefinition, 'id'>) => {
    const newDef = { ...def, id: `def-${Date.now()}` };
    setDefinitions([...definitions, newDef]);
  };

  const updateDefinition = (id: string, updates: Partial<CertificateDefinition>) => {
    setDefinitions(definitions.map(d => (d.id === id ? { ...d, ...updates } : d)));
  };

  const deleteDefinition = (id: string) => {
    setDefinitions(definitions.filter(d => d.id !== id));
  };

  const assignCertificate = (cert: Omit<UserCertificate, 'id'>) => {
    const newCert = { ...cert, id: `uc-${Date.now()}` };
    setUserCertificates([...userCertificates, newCert]);
  };

  const getUserCertificates = (userId: string) => {
    return userCertificates
      .filter(uc => uc.userId === userId)
      .map(uc => {
        const definition = definitions.find(d => d.id === uc.definitionId);
        if (!definition) return null;
        return { ...uc, definition };
      })
      .filter((item): item is UserCertificate & { definition: CertificateDefinition } => item !== null);
  };

  return (
    <CertificatesContext.Provider value={{
      definitions,
      userCertificates,
      addDefinition,
      updateDefinition,
      deleteDefinition,
      assignCertificate,
      getUserCertificates
    }}>
      {children}
    </CertificatesContext.Provider>
  );
}

export function useCertificates() {
  const context = useContext(CertificatesContext);
  if (context === undefined) {
    throw new Error('useCertificates must be used within a CertificatesProvider');
  }
  return context;
}
