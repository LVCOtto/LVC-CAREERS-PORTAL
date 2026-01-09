export interface CompetencyItem {
  id: string;
  name: string;
  description?: string;
}

export interface CompetencyCategory {
  id: string;
  name: string;
  items: CompetencyItem[];
}

export interface EngineerRating {
  competencyId: string;
  rating: number;
  lastUpdated?: string;
}

export interface EngineerMatrix {
  id: string;
  name: string;
  role: string;
  department: string;
  ratings: Record<string, number>;
  lastAssessment: string;
}

export const competencyLevels = [
  { value: 0, label: 'No Experience', description: 'Has no experience, or does not understand', color: 'bg-gray-200 text-gray-600' },
  { value: 1, label: 'Needs Training', description: 'Has some experience but not confident, more training required', color: 'bg-red-100 text-red-700' },
  { value: 2, label: 'Developing', description: 'Has experience and is reasonably confident but occasional support required', color: 'bg-amber-100 text-amber-700' },
  { value: 3, label: 'Competent', description: 'Is highly confident and does not require support', color: 'bg-emerald-100 text-emerald-700' },
  { value: 4, label: 'Expert/Trainer', description: 'Thorough knowledge, willing and able to train others', color: 'bg-blue-100 text-blue-700' },
];

export const engineeringCategories: CompetencyCategory[] = [
  {
    id: 'safety',
    name: 'Occupational Safety and Health',
    items: [
      { id: 'manual-handling', name: 'Manual Handling' },
      { id: 'safe-loads', name: 'Safe securing of loads' },
      { id: 'lone-working', name: 'Lone working' },
      { id: 'noise', name: 'Noise' },
      { id: 'dust-protection', name: 'Dust - mask protection' },
      { id: 'hand-tools', name: 'Use of Hand tools' },
      { id: 'coshh', name: 'Chemical COSHH training' },
      { id: 'van-safety', name: 'Transport - Van safety, Van checklist' },
      { id: 'safe-driving', name: 'Driving spatial awareness - Safe driving' },
      { id: 'slips-trips', name: 'Slips, trips and falls' },
      { id: 'accident-reporting', name: 'Accident & Hazard reporting' },
      { id: 'electrical-safety', name: 'Electrical Safety' },
      { id: 'battery-safety', name: 'Battery Safety (including transport and storage)' },
      { id: 'rams', name: 'Following LVC RAMS procedure' },
      { id: 'stress', name: 'Stress' },
      { id: 'ppe', name: 'PPE - use of' },
      { id: 'pat-testing', name: 'PAT Testing' },
    ],
  },
  {
    id: 'operations',
    name: 'Operational Processes and Communication',
    items: [
      { id: 'protean-jobs', name: 'Use of Protean - Completing Jobs and Adding Parts' },
      { id: 'prepare-quote', name: 'Prepare quote (Further Work Required)' },
      { id: 'plan-workload', name: 'Plan workload (View Jobs + Book in)' },
      { id: 'job-process', name: 'Process before/after finishing each job' },
      { id: 'method-statement', name: 'Adhering to Method statement - Safe method of work' },
      { id: 'order-parts', name: 'Order of parts/consumables' },
      { id: 'timesheet', name: 'Protean Timesheet' },
      { id: 'workshop-booking', name: 'Booking in at workshop - return & communication' },
      { id: 'comms-policy', name: 'Communication Policy' },
      { id: 'ms-teams', name: 'Microsoft Teams' },
    ],
  },
  {
    id: 'vacuums',
    name: 'Technical Expertise - Vacuums',
    items: [
      { id: 'tub-vacuum-repair', name: 'Tub vacuum/backpack - Repair and Service' },
      { id: 'tub-vacuum-operation', name: 'Tub vacuum/backpack - Safe Operation' },
      { id: 'upright-vacuum-repair', name: 'Upright Vacuum - Repair and Service' },
      { id: 'upright-vacuum-operation', name: 'Upright Vacuum - Safe Operation' },
    ],
  },
  {
    id: 'buffers-carpet',
    name: 'Technical Expertise - Buffers and Carpet',
    items: [
      { id: 'rotary-repair', name: 'Rotary Scrubbers/Buffers - Repair and Service' },
      { id: 'rotary-operation', name: 'Rotary Scrubbers/Buffers - Safe Operation' },
      { id: 'carpet-small-repair', name: 'Carpet Cleaner (Small) - Repair and Service', description: 'i.e. Bissell DC100, Rugdoctor etc.' },
      { id: 'carpet-small-operation', name: 'Carpet Cleaner (Small) - Safe Operation' },
      { id: 'carpet-large-repair', name: 'Carpet Cleaner (Large) - Repair and Service', description: 'i.e. CEX410, ES300' },
      { id: 'carpet-large-operation', name: 'Carpet Cleaner (Large) - Safe Operation' },
      { id: 'carpet-sweeper-repair', name: 'Carpet Sweeper (Ride On) - Repair and Service' },
      { id: 'carpet-sweeper-operation', name: 'Carpet Sweeper (Ride On) - Safe Operation' },
    ],
  },
  {
    id: 'scrubbers-steam',
    name: 'Technical Expertise - Scrubber Dryers and Steam',
    items: [
      { id: 'scrubber-small-repair', name: 'Scrubber Dryer (Small) - Repair and Service', description: 'i.e. Imop XL' },
      { id: 'scrubber-small-operation', name: 'Scrubber Dryer (Small) - Safe Operation' },
      { id: 'scrubber-medium-repair', name: 'Scrubber Dryer (Medium) - Repair and Service', description: 'i.e. AS430B, SC800' },
      { id: 'scrubber-medium-operation', name: 'Scrubber Dryer (Medium) - Safe Operation' },
      { id: 'scrubber-rideon-repair', name: 'Scrubber Dryer (Ride On) - Repair and Service' },
      { id: 'scrubber-rideon-operation', name: 'Scrubber Dryer (Ride On) - Safe Operation' },
      { id: 'steam-repair', name: 'Steam Machines - Repair and Service' },
      { id: 'steam-operation', name: 'Steam Machines - Safe Operation' },
    ],
  },
  {
    id: 'specialist',
    name: 'Technical Expertise - Misc and Specialist',
    items: [
      { id: 'batteries', name: 'Batteries - Safety, testing and service' },
      { id: 'pressure-small-repair', name: 'Pressure Washer (Small) - Repair and Service', description: 'i.e. Domestic, Karcher K4 etc.' },
      { id: 'pressure-small-operation', name: 'Pressure Washer (Small) - Safe Operation' },
      { id: 'pressure-medium-repair', name: 'Pressure Washer (Medium Hot) - Repair and Service' },
      { id: 'pressure-medium-operation', name: 'Pressure Washer (Medium Hot) - Safe Operation' },
      { id: 'pressure-large-repair', name: 'Pressure Washer (Large Hot) - Repair and Service' },
      { id: 'pressure-large-operation', name: 'Pressure Washer (Large Hot) - Safe Operation' },
      { id: 'engine-repairs', name: 'Engine Repairs' },
      { id: 'hydraulic-systems', name: 'Hydraulic Systems' },
    ],
  },
  {
    id: 'misc',
    name: 'Misc',
    items: [
      { id: 'social-media', name: 'Sharing/Posting work related media (LinkedIn etc.)' },
      { id: 'chemicals', name: 'Correct use/dosage of chemicals' },
      { id: 'consumables', name: 'Correct use of consumables (Pads, Brushes etc.)' },
      { id: 'operator-training', name: 'Running operator training sessions' },
      { id: 'customer-service', name: 'Customer Service' },
    ],
  },
];

export const adminCategories: CompetencyCategory[] = [
  {
    id: 'admin-core',
    name: 'Core Administrative Skills',
    items: [
      { id: 'phone-handling', name: 'Professional Phone Handling' },
      { id: 'email-comms', name: 'Email Communications' },
      { id: 'filing-systems', name: 'Filing Systems & Document Management' },
      { id: 'data-entry', name: 'Data Entry & Accuracy' },
      { id: 'scheduling', name: 'Scheduling & Calendar Management' },
    ],
  },
  {
    id: 'admin-systems',
    name: 'Systems & Software',
    items: [
      { id: 'protean-admin', name: 'Protean - Job Management' },
      { id: 'protean-invoicing', name: 'Protean - Invoicing' },
      { id: 'ms-office', name: 'Microsoft Office Suite' },
      { id: 'ms-teams-admin', name: 'Microsoft Teams' },
      { id: 'smartsheet', name: 'Smartsheet' },
    ],
  },
  {
    id: 'admin-service',
    name: 'Service Administration',
    items: [
      { id: 'job-booking', name: 'Job Booking & Allocation' },
      { id: 'parts-ordering', name: 'Parts Ordering' },
      { id: 'warranty-claims', name: 'Warranty Claims Processing' },
      { id: 'customer-queries', name: 'Customer Query Resolution' },
      { id: 'report-generation', name: 'Report Generation' },
    ],
  },
];

function generateRandomRatings(categories: CompetencyCategory[], bias: 'junior' | 'mid' | 'senior'): Record<string, number> {
  const ratings: Record<string, number> = {};
  const biasRanges = {
    junior: { min: 0, max: 2, avgWeight: 1 },
    mid: { min: 1, max: 3, avgWeight: 2 },
    senior: { min: 2, max: 4, avgWeight: 3 },
  };
  const range = biasRanges[bias];
  
  categories.forEach(category => {
    category.items.forEach(item => {
      const random = Math.random();
      let rating: number;
      if (random < 0.2) {
        rating = Math.max(0, range.avgWeight - 2);
      } else if (random < 0.8) {
        rating = range.avgWeight + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2);
      } else {
        rating = Math.min(4, range.avgWeight + 1);
      }
      ratings[item.id] = Math.max(range.min, Math.min(range.max, rating));
    });
  });
  
  return ratings;
}

export const engineerMatrices: EngineerMatrix[] = [
  {
    id: 'eng-1',
    name: 'James Wilson',
    role: 'Senior Engineer',
    department: 'Engineering',
    ratings: generateRandomRatings(engineeringCategories, 'senior'),
    lastAssessment: '2025-11-15',
  },
  {
    id: 'eng-2',
    name: 'Michael Brown',
    role: 'Engineer',
    department: 'Engineering',
    ratings: generateRandomRatings(engineeringCategories, 'mid'),
    lastAssessment: '2025-10-28',
  },
  {
    id: 'eng-3',
    name: 'David Thompson',
    role: 'Junior Engineer',
    department: 'Engineering',
    ratings: generateRandomRatings(engineeringCategories, 'junior'),
    lastAssessment: '2025-12-01',
  },
  {
    id: 'eng-4',
    name: 'Robert Clarke',
    role: 'Engineer',
    department: 'Engineering',
    ratings: generateRandomRatings(engineeringCategories, 'mid'),
    lastAssessment: '2025-09-20',
  },
];

export const adminMatrices: EngineerMatrix[] = [
  {
    id: 'admin-1',
    name: 'Sarah Mitchell',
    role: 'Service Administrator',
    department: 'Service Admin',
    ratings: generateRandomRatings(adminCategories, 'senior'),
    lastAssessment: '2025-11-10',
  },
  {
    id: 'admin-2',
    name: 'Emma Johnson',
    role: 'Administrator',
    department: 'Service Admin',
    ratings: generateRandomRatings(adminCategories, 'mid'),
    lastAssessment: '2025-10-15',
  },
];

export function getCompetencyColor(rating: number): string {
  return competencyLevels[rating]?.color || competencyLevels[0].color;
}

export function calculateCategoryAverage(ratings: Record<string, number>, category: CompetencyCategory): number {
  const categoryRatings = category.items.map(item => ratings[item.id] ?? 0);
  return categoryRatings.reduce((a, b) => a + b, 0) / categoryRatings.length;
}

export function calculateOverallAverage(ratings: Record<string, number>, categories: CompetencyCategory[]): number {
  let total = 0;
  let count = 0;
  categories.forEach(cat => {
    cat.items.forEach(item => {
      total += ratings[item.id] ?? 0;
      count++;
    });
  });
  return count > 0 ? total / count : 0;
}

export interface SkillGap {
  engineerId: string;
  engineerName: string;
  competencyId: string;
  competencyName: string;
  categoryName: string;
  currentRating: number;
  targetRating: number;
}

export interface ScheduledTraining {
  id: string;
  competencyId: string;
  competencyName: string;
  categoryName: string;
  attendees: { id: string; name: string }[];
  scheduledDate: string;
  trainer: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export function identifySkillGaps(
  engineers: EngineerMatrix[],
  categories: CompetencyCategory[],
  threshold: number = 1
): SkillGap[] {
  const gaps: SkillGap[] = [];
  
  engineers.forEach(engineer => {
    categories.forEach(category => {
      category.items.forEach(item => {
        const rating = engineer.ratings[item.id] ?? 0;
        if (rating <= threshold) {
          gaps.push({
            engineerId: engineer.id,
            engineerName: engineer.name,
            competencyId: item.id,
            competencyName: item.name,
            categoryName: category.name,
            currentRating: rating,
            targetRating: 3,
          });
        }
      });
    });
  });
  
  return gaps.sort((a, b) => a.currentRating - b.currentRating);
}

export const scheduledTrainingSessions: ScheduledTraining[] = [
  {
    id: 'ts-1',
    competencyId: 'battery-safety',
    competencyName: 'Battery Safety (including transport and storage)',
    categoryName: 'Occupational Safety and Health',
    attendees: [
      { id: 'eng-3', name: 'David Thompson' },
      { id: 'eng-2', name: 'Michael Brown' },
    ],
    scheduledDate: '2026-01-15',
    trainer: 'James Wilson',
    status: 'scheduled',
    notes: 'Focus on lithium battery handling procedures',
  },
  {
    id: 'ts-2',
    competencyId: 'hydraulic-systems',
    competencyName: 'Hydraulic Systems',
    categoryName: 'Technical Expertise - Misc and Specialist',
    attendees: [
      { id: 'eng-3', name: 'David Thompson' },
    ],
    scheduledDate: '2026-01-22',
    trainer: 'External - Hydraulics Ltd',
    status: 'scheduled',
  },
  {
    id: 'ts-3',
    competencyId: 'coshh',
    competencyName: 'Chemical COSHH training',
    categoryName: 'Occupational Safety and Health',
    attendees: [
      { id: 'eng-2', name: 'Michael Brown' },
      { id: 'eng-3', name: 'David Thompson' },
      { id: 'eng-4', name: 'Robert Clarke' },
    ],
    scheduledDate: '2025-12-10',
    trainer: 'i-Hasco (Online)',
    status: 'completed',
  },
];
