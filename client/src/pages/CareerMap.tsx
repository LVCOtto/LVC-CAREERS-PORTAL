import { useAuth } from '@/lib/authContext';
import { Layout } from '@/components/Layout';
import { useCareerPath, CareerNode } from '@/lib/careerPathContext';
import { useCertificates } from '@/lib/certificatesContext';
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
  Target
} from 'lucide-react';
import { useMemo } from 'react';

export default function CareerMap() {
  const { currentUser } = useAuth();
  const { nodes: careerNodes } = useCareerPath();
  const { getUserCertificates } = useCertificates();

  if (!currentUser) return null;

  const userCertificates = getUserCertificates(currentUser.id);

  // 1. Determine Current Node
  const currentNodeId = useMemo(() => {
    const match = careerNodes.find(n => n.title.toLowerCase() === currentUser.jobRole.toLowerCase());
    return match ? match.id : 'field-service-engineer';
  }, [careerNodes, currentUser.jobRole]);

  const currentNode = careerNodes.find(n => n.id === currentNodeId);

  // 2. Determine History (Nodes with lower level)
  // In a real app, we'd traverse the specific path taken. Here we assume level < currentLevel on the same path.
  // For simplicity in this mockup, we'll just grab lower levels.
  const historyNodes = careerNodes
    .filter(n => n.level < (currentNode?.level || 1))
    .sort((a, b) => b.level - a.level); // Most recent history first

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

        {/* History Section - Subdued */}
        {historyNodes.length > 0 && (
          <div className="mt-12 pt-8 border-t">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-6 text-slate-600">
              <History className="w-5 h-5" />
              Career History
            </h3>
            
            <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {historyNodes.map((node) => (
                <div key={node.id} className="relative">
                  <div className="absolute -left-[2.35rem] w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 border-2 border-white ring-1 ring-slate-200 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-800">{node.title}</h4>
                      <Badge variant="secondary" className="text-xs font-normal">Level {node.level}</Badge>
                    </div>
                    <p className="text-sm text-slate-500">{node.description}</p>
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
