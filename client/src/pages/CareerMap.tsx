import { useAuth } from '@/lib/authContext';
import { Layout } from '@/components/Layout';
import { useCareerPath, CareerNode } from '@/lib/careerPathContext';
import { useCertificates } from '@/lib/certificatesContext';
import { careerMilestones } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Briefcase, 
  ChevronRight, 
  Lock, 
  Unlock, 
  Star, 
  Trophy, 
  ArrowRight,
  CheckCircle2,
  History,
  Map as MapIcon,
  ArrowUp,
  Target,
  GraduationCap,
  Award,
  Users,
  CalendarDays,
  Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';

// Helper to get milestone icons
const getMilestoneIcon = (title: string) => {
  if (title.toLowerCase().includes('joined')) return <Briefcase className="w-4 h-4" />;
  if (title.toLowerCase().includes('promotion')) return <Trophy className="w-4 h-4" />;
  if (title.toLowerCase().includes('induction')) return <GraduationCap className="w-4 h-4" />;
  if (title.toLowerCase().includes('award')) return <Award className="w-4 h-4" />;
  return <Star className="w-4 h-4" />;
};

export default function CareerMap() {
  const { currentUser } = useAuth();
  const { nodes: careerNodes } = useCareerPath();
  const { getUserCertificates } = useCertificates();

  if (!currentUser) return null;

  const userCertificates = getUserCertificates(currentUser.id);
  const userMilestones = careerMilestones.filter(m => m.userId === currentUser.id);

  // 1. Determine Current Node
  const currentNodeId = useMemo(() => {
    const match = careerNodes.find(n => n.title.toLowerCase() === currentUser.jobRole.toLowerCase());
    return match ? match.id : 'field-service-engineer';
  }, [careerNodes, currentUser.jobRole]);

  const currentNode = careerNodes.find(n => n.id === currentNodeId);

  // 2. Determine History (Nodes with lower level) + Milestones
  const historyNodes = careerNodes
    .filter(n => n.level < (currentNode?.level || 1))
    .map(node => ({
      type: 'role_change',
      id: node.id,
      title: `Promoted to ${node.title}`,
      description: node.description,
      date: '2023-01-01', // Mock date since nodes don't have user-specific dates yet
      icon: <Briefcase className="w-4 h-4" />,
      level: node.level
    }));

  const milestones = userMilestones.map(m => ({
    type: 'milestone',
    id: m.id,
    title: m.title,
    description: m.description,
    date: m.date,
    icon: getMilestoneIcon(m.title)
  }));

  // Combine and sort by date (descending)
  const historyTimeline = [...historyNodes, ...milestones].sort((a, b) => {
    if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return 0; 
  });

  // 3. Determine Next Step (Direct next step)
  const nextStepIds = currentNode?.nextSteps || [];
  const nextStepNode = careerNodes.find(n => nextStepIds.includes(n.id));

  // 4. Calculate Progress for Next Step
  const nextStepRequirements = nextStepNode?.requirements || [];
  const completedRequirements = nextStepRequirements.filter(req => {
    if (!req.certificateId) return false;
    return userCertificates.some(uc => uc.definitionId === req.certificateId);
  });
  const progressPercent = nextStepRequirements.length > 0 
    ? Math.round((completedRequirements.length / nextStepRequirements.length) * 100)
    : 0;

  // 5. Check if next step is calibrated
  const isNextStepCalibrated = currentUser.nextRoleCalibrated;

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground">Your Career Journey</h1>
            <p className="text-lg text-muted-foreground mt-1">
              Shape your own path at LVC
            </p>
          </div>
        </div>

        {/* Main Content: Current Role + History */}
        <div className="space-y-8">
            
             {/* Current Role Card - Center Stage */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-primary/5 to-background relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Star className="w-48 h-48 text-primary" />
              </div>
              
              <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-primary text-primary-foreground border-none">Current Role</Badge>
                            <Badge variant="outline" className="border-primary/30 text-primary">Level {currentNode?.level}</Badge>
                        </div>
                        <CardTitle className="text-3xl">{currentNode?.title}</CardTitle>
                        <CardDescription className="text-lg mt-2">{currentNode?.description}</CardDescription>
                    </div>
                    {/* Progression Trigger - Small Feature */}
                    {nextStepNode && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="gap-2 border-dashed border-primary/40 hover:bg-primary/5 hover:border-primary/60">
                                    <MapIcon className="w-4 h-4 text-primary" />
                                    Explore Next Step
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl flex items-center gap-2">
                                        <Target className="w-6 h-6 text-amber-500" />
                                        Next Potential Role: {nextStepNode.title}
                                    </DialogTitle>
                                    <DialogDescription>
                                        Requirements and steps needed to progress to the next level.
                                    </DialogDescription>
                                </DialogHeader>
                                
                                {isNextStepCalibrated ? (
                                    <div className="space-y-6 py-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="font-medium text-slate-700">Readiness</span>
                                                <span className="text-muted-foreground">{completedRequirements.length}/{nextStepRequirements.length} Requirements</span>
                                            </div>
                                            <Progress value={progressPercent} className="h-2 bg-amber-100 [&>div]:bg-amber-500" />
                                        </div>

                                        <div className="space-y-3">
                                            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Required to Unlock</h4>
                                            {nextStepRequirements.map((req, idx) => {
                                                const hasCert = req.certificateId ? userCertificates.some(uc => uc.definitionId === req.certificateId) : false;
                                                return (
                                                    <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${hasCert ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}>
                                                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${hasCert ? 'bg-emerald-100 text-emerald-600' : 'bg-white border border-slate-300 text-slate-300'}`}>
                                                            {hasCert ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Lock className="w-3 h-3" />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className={`text-sm font-medium ${hasCert ? 'text-emerald-900' : 'text-slate-700'}`}>{req.description}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center space-y-4">
                                        <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                            <Users className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <p className="text-slate-600 max-w-sm mx-auto">
                                            Your career path hasn't been calibrated yet. Schedule a chat with your manager to discuss your future goals.
                                        </p>
                                        <Button variant="outline">Request Calibration</Button>
                                    </div>
                                )}
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <div className="bg-background/60 backdrop-blur-sm p-4 rounded-xl border shadow-sm max-w-3xl">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Key Responsibilities
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>Lead technical equipment diagnostics and repairs</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>Mentor junior engineers on site visits</span>
                    </li>
                     <li className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>Ensure 100% compliance with safety protocols</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* History Section - Combined Milestones & Roles */}
            {historyTimeline.length > 0 && (
              <div className="pt-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-6 text-slate-600">
                  <History className="w-5 h-5" />
                  Journey So Far
                </h3>
                
                <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {historyTimeline.map((item, index) => (
                    <div key={index} className="relative group">
                      <div className={`absolute -left-[2.35rem] w-6 h-6 rounded-full border-2 border-white ring-1 ring-slate-200 flex items-center justify-center transition-colors ${item.type === 'role_change' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {item.icon}
                      </div>
                      <div className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-slate-800">{item.title}</h4>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {item.date ? new Date(item.date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : 'Previous'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">{item.description}</p>
                        {item.type === 'role_change' && (
                            <Badge variant="secondary" className="mt-2 text-xs font-normal">Career Step</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    </Layout>
  );
}
