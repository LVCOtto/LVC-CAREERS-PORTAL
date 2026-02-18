import { useAuth } from '@/lib/authContext';
import { Layout } from '@/components/Layout';
import { useCareerPath, CareerNode } from '@/lib/careerPathContext';
import { useCertificates } from '@/lib/certificatesContext';
import { careerMilestones } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  Award
} from 'lucide-react';
import { useMemo } from 'react';

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
    // In a real app with real dates for roles, we'd sort properly.
    // For now, let's just interleave them. Milestones have real dates.
    // Let's assume role changes happened in the past for this mock.
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

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
        
        {/* Header Section */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="font-display text-4xl font-bold text-foreground">Your Career Path</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Focus on what's next. Track your progress to the next level and review your achievements.
          </p>
        </div>

        {/* MAIN FOCUS: The Transition (Current -> Next) */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch relative">
          
          {/* Connector Arrow for Desktop */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-background p-2 rounded-full border shadow-sm text-muted-foreground">
            <ArrowRight className="w-6 h-6" />
          </div>

          {/* Current Role Card */}
          <Card className="border-primary/20 bg-primary/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Star className="w-32 h-32 text-primary" />
            </div>
            
            <CardHeader>
              <Badge className="w-fit mb-2 bg-primary/20 text-primary hover:bg-primary/30 border-none">Current Role</Badge>
              <CardTitle className="text-2xl">{currentNode?.title}</CardTitle>
              <CardDescription className="text-base">{currentNode?.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground bg-background/50 p-3 rounded-lg border border-primary/10">
                  <Briefcase className="w-4 h-4" />
                  <span>{currentNode?.department} Department</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground bg-background/50 p-3 rounded-lg border border-primary/10">
                  <Trophy className="w-4 h-4" />
                  <span>Level {currentNode?.level} Achieved</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Step Card - The "Target" */}
          {nextStepNode ? (
            <Card className="border-2 border-amber-400 shadow-lg shadow-amber-100/50 relative overflow-hidden bg-white">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
               
               <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="w-fit mb-2 border-amber-400 text-amber-600 bg-amber-50">Next Objective</Badge>
                  <span className="text-sm font-bold text-amber-600">{progressPercent}% Ready</span>
                </div>
                <CardTitle className="text-2xl">{nextStepNode.title}</CardTitle>
                <CardDescription className="text-base">{nextStepNode.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-slate-700">Promotion Readiness</span>
                    <span className="text-muted-foreground">{completedRequirements.length}/{nextStepRequirements.length} Requirements</span>
                  </div>
                  <Progress value={progressPercent} className="h-2 bg-amber-100 [&>div]:bg-amber-500" />
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Required to Unlock
                  </h4>
                  {nextStepRequirements.map((req, idx) => {
                    const hasCert = req.certificateId ? userCertificates.some(uc => uc.definitionId === req.certificateId) : false;
                    return (
                      <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${hasCert ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100 hover:border-amber-200'}`}>
                         <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${hasCert ? 'bg-emerald-100 text-emerald-600' : 'bg-white border border-slate-300 text-slate-300'}`}>
                            {hasCert ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Lock className="w-3 h-3" />}
                         </div>
                         <div className="flex-1">
                           <p className={`text-sm font-medium ${hasCert ? 'text-emerald-900' : 'text-slate-700'}`}>{req.description}</p>
                           {!hasCert && req.certificateId && (
                             <p className="text-xs text-amber-600 mt-1 flex items-center gap-1 cursor-pointer hover:underline">
                               View Certificate Details <ChevronRight className="w-3 h-3" />
                             </p>
                           )}
                         </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>

              <CardFooter>
                 <Button className="w-full bg-slate-900 hover:bg-slate-800" disabled={progressPercent < 100}>
                    {progressPercent < 100 ? 'Complete Requirements to Apply' : 'Apply for Promotion'}
                 </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="bg-slate-50 border-dashed flex flex-col items-center justify-center text-center p-8">
              <Trophy className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-600">Top of Track</h3>
              <p className="text-muted-foreground mt-2 max-w-xs">
                You have reached the highest level in this technical track. Discuss leadership or specialist pivot opportunities with your manager.
              </p>
            </Card>
          )}
        </div>

        {/* History Section - Combined Milestones & Roles */}
        {historyTimeline.length > 0 && (
          <div className="mt-12 pt-8 border-t">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-6 text-slate-600">
              <History className="w-5 h-5" />
              History & Milestones
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
    </Layout>
  );
}
