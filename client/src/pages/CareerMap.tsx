import { useAuth } from '@/lib/authContext';
import { Layout } from '@/components/Layout';
import { useCareerPath, CareerNode } from '@/lib/careerPathContext';
import { useCertificates } from '@/lib/certificatesContext';
import { careerMilestones } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Sparkles,
  Zap,
  BookOpen
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
  const [activeTab, setActiveTab] = useState("current"); // "current" | "next"

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground">Your Career Journey</h1>
            <p className="text-lg text-muted-foreground mt-1">
              Shape your own path at LVC
            </p>
          </div>
        </div>

        {/* Focus Selector */}
        <Tabs defaultValue="current" className="w-full" onValueChange={setActiveTab}>
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="current">Deepen Expertise</TabsTrigger>
              <TabsTrigger value="next">Explore Progression</TabsTrigger>
            </TabsList>
          </div>

          {/* MODE 1: Deepen Expertise (Focus on Current Role) */}
          <TabsContent value="current" className="space-y-6 animate-fade-in">
             <div className="text-center max-w-2xl mx-auto mb-8">
               <h2 className="text-2xl font-semibold mb-2">Master Your Craft</h2>
               <p className="text-muted-foreground">
                 Focus on becoming an expert in your current role. Build specialized skills, mentor others, and achieve excellence.
               </p>
             </div>

             <div className="grid md:grid-cols-3 gap-6">
                {/* Main Role Card - Center Stage */}
                <Card className="md:col-span-2 border-primary/20 bg-gradient-to-br from-primary/5 via-primary/5 to-background relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Star className="w-48 h-48 text-primary" />
                  </div>
                  
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-primary text-primary-foreground border-none">Current Role</Badge>
                      <Badge variant="outline" className="border-primary/30 text-primary">Level {currentNode?.level}</Badge>
                    </div>
                    <CardTitle className="text-3xl">{currentNode?.title}</CardTitle>
                    <CardDescription className="text-lg mt-2">{currentNode?.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 relative z-10">
                    <div className="bg-background/60 backdrop-blur-sm p-4 rounded-xl border shadow-sm">
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

                {/* Excellence & Growth Actions */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        Excellence Goals
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Customer Satisfaction</span>
                          <span className="text-emerald-600 font-bold">4.8/5.0</span>
                        </div>
                        <Progress value={96} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">First Time Fix Rate</span>
                          <span className="text-emerald-600 font-bold">92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full text-xs">View Performance Details</Button>
                    </CardFooter>
                  </Card>

                  <Card className="bg-slate-50 border-dashed">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-500" />
                        Specialist Skills
                      </CardTitle>
                      <CardDescription>Expand your expertise horizontally</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                       <Button variant="ghost" className="w-full justify-start h-auto py-3 px-3 bg-white border shadow-sm hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 group">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors">
                            <Zap className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-sm">Advanced Hydraulics</div>
                            <div className="text-xs text-muted-foreground group-hover:text-blue-600/80">Available Course</div>
                          </div>
                       </Button>
                       <Button variant="ghost" className="w-full justify-start h-auto py-3 px-3 bg-white border shadow-sm hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 group">
                          <div className="bg-purple-100 p-2 rounded-lg mr-3 group-hover:bg-purple-200 transition-colors">
                            <Users className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-sm">Mentor Certification</div>
                            <div className="text-xs text-muted-foreground group-hover:text-purple-600/80">Become a buddy</div>
                          </div>
                       </Button>
                    </CardContent>
                  </Card>
                </div>
             </div>
          </TabsContent>

          {/* MODE 2: Explore Progression (Focus on Next Role) */}
          <TabsContent value="next" className="space-y-8 animate-fade-in">
            <div className="text-center max-w-2xl mx-auto mb-8">
               <h2 className="text-2xl font-semibold mb-2">Plan Your Next Step</h2>
               <p className="text-muted-foreground">
                 Ready for a new challenge? Track your progress towards the next level and understand what's required to get there.
               </p>
             </div>

            <div className="grid md:grid-cols-2 gap-8 items-stretch relative">
              
              {/* Connector Arrow for Desktop */}
              <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-background p-2 rounded-full border shadow-sm text-muted-foreground">
                <ArrowRight className="w-6 h-6" />
              </div>

              {/* Current Role Card (Smaller version) */}
              <Card className="border-border bg-background/50 relative overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit mb-2">Current Role</Badge>
                  <CardTitle className="text-xl">{currentNode?.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground p-3 rounded-lg border bg-background/50">
                    <Trophy className="w-4 h-4" />
                    <span>Level {currentNode?.level} Achieved</span>
                  </div>
                </CardContent>
              </Card>

              {/* Next Step Card - Logic from before */}
              {isNextStepCalibrated && nextStepNode ? (
                <Card className="border-2 border-amber-400 shadow-lg shadow-amber-100/50 relative overflow-hidden bg-white">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
                  
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className="w-fit mb-2 border-amber-400 text-amber-600 bg-amber-50">Target Role</Badge>
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
              ) : !isNextStepCalibrated ? (
                /* Calibration Needed State */
                <Card className="border-2 border-dashed border-slate-300 bg-slate-50 relative overflow-hidden flex flex-col justify-center">
                  <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-slate-200">
                      <Users className="w-8 h-8 text-slate-400" />
                    </div>
                    <CardTitle className="text-xl text-slate-700">Next Step Pending</CardTitle>
                    <CardDescription className="max-w-xs mx-auto">
                      Your next career objective hasn't been calibrated yet.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="text-center space-y-4 max-w-sm mx-auto">
                    <p className="text-sm text-slate-500">
                      To ensure your career goals align with business opportunities, please schedule a career conversation with your line manager.
                    </p>
                    <Button className="w-full gap-2" variant="outline">
                        <CalendarDays className="w-4 h-4" />
                        Request Career Meeting
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                /* Top of Track State */
                <Card className="bg-slate-50 border-dashed flex flex-col items-center justify-center text-center p-8">
                  <Trophy className="w-12 h-12 text-slate-300 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-600">Top of Track</h3>
                  <p className="text-muted-foreground mt-2 max-w-xs">
                    You have reached the highest level in this technical track. Discuss leadership or specialist pivot opportunities with your manager.
                  </p>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

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
