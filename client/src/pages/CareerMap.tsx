import { useAuth } from '@/lib/authContext';
import { Layout } from '@/components/Layout';
import { useCareerPath, CareerNode } from '@/lib/careerPathContext';
import { useCertificates } from '@/lib/certificatesContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Briefcase, 
  ChevronRight, 
  Lock, 
  Unlock, 
  Star, 
  Trophy, 
  ArrowRight,
  CheckCircle2,
  XCircle,
  Map as MapIcon
} from 'lucide-react';
import { 
  ReactFlow, 
  Node, 
  Edge, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  MarkerType,
  Position,
  Handle
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEffect, useMemo, useState } from 'react';

// Custom Node Component for Career Steps
const CareerNodeComponent = ({ data }: { data: CareerNode & { status: 'current' | 'completed' | 'locked' | 'next', isTarget: boolean } }) => {
  const isCurrent = data.status === 'current';
  const isCompleted = data.status === 'completed';
  const isNext = data.status === 'next';
  const isLocked = data.status === 'locked';

  let borderColor = 'border-slate-300';
  let bgColor = 'bg-white';
  let textColor = 'text-slate-700';
  let shadow = 'shadow-sm';

  if (isCurrent) {
    borderColor = 'border-primary ring-2 ring-primary/20';
    bgColor = 'bg-primary/5';
    textColor = 'text-primary';
    shadow = 'shadow-md';
  } else if (isCompleted) {
    borderColor = 'border-emerald-500';
    bgColor = 'bg-emerald-50';
    textColor = 'text-emerald-700';
  } else if (isNext) {
    borderColor = 'border-amber-400 border-dashed';
    bgColor = 'bg-amber-50';
    textColor = 'text-amber-700';
  } else { // Locked
    bgColor = 'bg-slate-50';
    textColor = 'text-slate-400';
  }

  return (
    <div className={`w-[280px] rounded-xl border-2 ${borderColor} ${bgColor} ${shadow} transition-all p-0 overflow-hidden`}>
      <Handle type="target" position={Position.Left} className="!bg-slate-400 !w-3 !h-3" />
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className={`p-2 rounded-lg ${isCurrent ? 'bg-primary text-primary-foreground' : isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : isCurrent ? <Star className="w-5 h-5 fill-current" /> : isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
          </div>
          {isCurrent && <Badge className="bg-primary">Current Role</Badge>}
          {isNext && <Badge variant="outline" className="border-amber-400 text-amber-700 bg-amber-50">Next Step</Badge>}
        </div>
        
        <h3 className={`font-bold text-lg leading-tight mb-1 ${textColor}`}>{data.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2">{data.description}</p>
        
        {data.requirements.length > 0 && !isCompleted && !isCurrent && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Requirements:</p>
            <div className="space-y-1">
              {data.requirements.slice(0, 2).map((req, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span className="truncate">{req.description}</span>
                </div>
              ))}
              {data.requirements.length > 2 && (
                <span className="text-[10px] text-muted-foreground pl-3">+{data.requirements.length - 2} more</span>
              )}
            </div>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-slate-400 !w-3 !h-3" />
    </div>
  );
};

const nodeTypes = {
  careerNode: CareerNodeComponent,
};

export default function CareerMap() {
  const { currentUser } = useAuth();
  const { nodes: careerNodes, getCareerPath } = useCareerPath();
  const { getUserCertificates } = useCertificates();
  
  // ReactFlow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  if (!currentUser) return null;

  const userCertificates = getUserCertificates(currentUser.id);

  // In a real app, we'd determine current node dynamically. For mock, let's assume 'field-service-engineer'
  // Or match by role title
  const currentNodeId = useMemo(() => {
    const match = careerNodes.find(n => n.title.toLowerCase() === currentUser.jobRole.toLowerCase());
    return match ? match.id : 'field-service-engineer'; // Default fallback
  }, [careerNodes, currentUser.jobRole]);

  useEffect(() => {
    // Build the graph layout
    // We'll use a simple grid layout logic for this prototype
    // X axis = Level (timeline), Y axis = Branches (department) - simplified here to just X
    
    // We want to show the full map, but highlight the path
    const layoutNodes: Node[] = [];
    const layoutEdges: Edge[] = [];

    const levelSpacing = 350;
    const verticalSpacing = 200; // Not used heavily in linear path but ready for branches

    // Calculate node positions
    careerNodes.forEach((cNode) => {
        let status: 'current' | 'completed' | 'locked' | 'next' = 'locked';
        
        const cNodeLevel = cNode.level;
        const currentNode = careerNodes.find(n => n.id === currentNodeId);
        const currentLevel = currentNode?.level || 1;

        if (cNode.id === currentNodeId) {
            status = 'current';
        } else if (cNodeLevel < currentLevel) {
            status = 'completed';
        } else if (currentNode?.nextSteps.includes(cNode.id)) {
            status = 'next';
        }

        layoutNodes.push({
            id: cNode.id,
            type: 'careerNode',
            position: { x: (cNodeLevel - 1) * levelSpacing, y: 100 }, // Simple horizontal line for now
            data: { ...cNode, status }
        });

        // Create edges
        cNode.nextSteps.forEach(nextId => {
            layoutEdges.push({
                id: `${cNode.id}-${nextId}`,
                source: cNode.id,
                target: nextId,
                type: 'smoothstep',
                markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
                style: { stroke: '#cbd5e1', strokeWidth: 2 },
                animated: status === 'current' && nextId // Animate edge from current to next
            });
        });
    });

    setNodes(layoutNodes);
    setEdges(layoutEdges);

  }, [careerNodes, currentNodeId, setNodes, setEdges]);

  // Find the next role details for the summary card
  const currentNode = careerNodes.find(n => n.id === currentNodeId);
  const nextRoleIds = currentNode?.nextSteps || [];
  const nextRoles = careerNodes.filter(n => nextRoleIds.includes(n.id));

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in h-[calc(100vh-100px)] flex flex-col">
        <div className="flex-none">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
                <MapIcon className="w-8 h-8 text-primary" />
                Interactive Career Roadmap
              </h1>
              <p className="text-muted-foreground mt-1">
                Visualise your journey at LVC and see exactly what you need to reach the next level.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
          {/* Main Map Area */}
          <Card className="lg:col-span-3 border-border/50 shadow-sm overflow-hidden flex flex-col">
            <CardHeader className="bg-slate-50/50 border-b pb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-white">Engineering Track</Badge>
                <span className="text-xs text-muted-foreground">Scroll to zoom • Drag to pan</span>
              </div>
            </CardHeader>
            <div className="flex-1 bg-slate-50/30 relative">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                attributionPosition="bottom-right"
              >
                <Background color="#e2e8f0" gap={20} size={1} />
                <Controls showInteractive={false} />
              </ReactFlow>
            </div>
          </Card>

          {/* Sidebar - Next Step Details */}
          <div className="space-y-6 overflow-y-auto pr-1">
            <Card className="border-l-4 border-l-amber-400 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Next Objective
                </CardTitle>
                <CardDescription>
                  Your immediate career progression target
                </CardDescription>
              </CardHeader>
              <CardContent>
                {nextRoles.length > 0 ? (
                  <div className="space-y-6">
                    {nextRoles.map(role => (
                      <div key={role.id}>
                        <h3 className="font-bold text-lg text-foreground mb-1">{role.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{role.description}</p>
                        
                        <div className="space-y-3">
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">To Unlock This Role:</p>
                          {role.requirements.map((req, idx) => {
                            // Check if user has this cert
                            const hasCert = req.certificateId ? userCertificates.some(uc => uc.definitionId === req.certificateId) : false;
                            
                            return (
                              <div key={idx} className={`flex items-start gap-3 p-2 rounded-lg border ${hasCert ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
                                <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${hasCert ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                  {hasCert ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Lock className="w-3 h-3" />}
                                </div>
                                <div>
                                  <p className={`text-sm font-medium ${hasCert ? 'text-emerald-900' : 'text-slate-700'}`}>{req.description}</p>
                                  {hasCert && <p className="text-[10px] text-emerald-600">Completed</p>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <Button className="w-full mt-6 gap-2" variant="default">
                          View Full Requirements
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Star className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                    <h3 className="font-bold text-foreground">You've reached the top!</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      You are currently at the highest defined level for this track. Speak to your manager about specialized opportunities.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/20 rounded-xl">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Why this matters?</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      LVC is committed to promoting from within. This roadmap shows you exactly what skills and certifications are valued for your next promotion.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
