import { useAuth } from '@/lib/authContext';
import { Layout } from '@/components/Layout';
import { useCareerMilestones, useCareerNodes } from '@/lib/hooks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Briefcase, 
  ChevronRight, 
  Star, 
  Trophy, 
  ArrowRight,
  CheckCircle2,
  History,
  GraduationCap,
  Award,
  Zap,
  BookOpen,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const { data: careerNodes = [] } = useCareerNodes();
  const { data: milestones = [] } = useCareerMilestones(currentUser?.id || '');

  if (!currentUser) return null;

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
      date: '2023-01-01', // Mock date
      icon: <Briefcase className="w-4 h-4" />,
      level: node.level
    }));

  const milestonesTimeline = milestones.map((m: any) => ({
    type: 'milestone',
    id: m.id,
    title: m.title,
    description: m.description,
    date: m.date,
    icon: getMilestoneIcon(m.title)
  }));

  // Combine and sort by date (descending)
  const historyTimeline = [...historyNodes, ...milestonesTimeline].sort((a, b) => {
    if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return 0; 
  });


  return (
    <Layout>
      <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground">Your Career Journey</h1>
            <p className="text-lg text-muted-foreground mt-1">
              Track your growth and development at LVC
            </p>
          </div>
        </div>

        {/* Visual Roadmap Container */}
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary/20 to-transparent -translate-x-1/2 z-0" />

          <div className="space-y-12 relative z-10">
            

            {/* CURRENT ROLE (Center Stage) */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
               <div className="order-2 md:order-1 flex justify-start md:justify-end">
                    <Card className="w-full max-w-lg border-primary/20 bg-white shadow-lg shadow-primary/5 relative overflow-hidden group hover:border-primary/40 transition-colors cursor-default">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                            <Star className="w-32 h-32 text-primary" />
                        </div>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 mb-2 border-none">Current Role</Badge>
                                    <CardTitle className="text-2xl">{currentNode?.title}</CardTitle>
                                    <CardDescription className="text-base">{currentNode?.department}</CardDescription>
                                </div>
                                <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center">
                                    <Briefcase className="w-5 h-5 text-primary" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                                    <Zap className="w-4 h-4 text-amber-500" />
                                    Performance & Growth
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-primary/20 hover:bg-primary/5 transition-colors cursor-pointer">
                                        <p className="text-xs text-muted-foreground mb-1">Competency</p>
                                        <div className="flex items-end gap-2">
                                            <span className="text-xl font-bold text-slate-800">92%</span>
                                            <span className="text-xs text-emerald-600 mb-1">Excellent</span>
                                        </div>
                                        <Progress value={92} className="h-1 mt-2" />
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-primary/20 hover:bg-primary/5 transition-colors cursor-pointer">
                                        <p className="text-xs text-muted-foreground mb-1">Training</p>
                                        <div className="flex items-end gap-2">
                                            <span className="text-xl font-bold text-slate-800">4/5</span>
                                            <span className="text-xs text-slate-500 mb-1">Modules</span>
                                        </div>
                                        <Progress value={80} className="h-1 mt-2" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                                    <BookOpen className="w-4 h-4 text-blue-500" />
                                    Development Focus
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 transition-colors cursor-pointer group/item">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        <span className="text-sm text-slate-600 group-hover/item:text-slate-900 flex-1">Advanced Hydraulics Certification</span>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover/item:text-slate-500" />
                                    </div>
                                    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 transition-colors cursor-pointer group/item">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        <span className="text-sm text-slate-600 group-hover/item:text-slate-900 flex-1">Mentorship Program (Mentee)</span>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover/item:text-slate-500" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
               </div>

               <div className="order-1 md:order-2 flex justify-start">
                  <div className="w-6 h-6 rounded-full bg-primary border-4 border-white shadow-md z-20 relative">
                    <div className="absolute inset-0 rounded-full animate-ping bg-primary/20"></div>
                  </div>
               </div>
            </div>

            {/* HISTORY (Past) */}
            <div className="space-y-8 pb-8">
                {historyTimeline.map((item, index) => (
                    <div key={index} className="grid md:grid-cols-2 gap-8 items-start opacity-70 hover:opacity-100 transition-opacity">
                        <div className="order-2 md:order-1 flex justify-start md:justify-end">
                            <div className="text-left md:text-right max-w-sm">
                                <h4 className="font-semibold text-slate-800">{item.title}</h4>
                                <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                                <p className="text-xs text-slate-400 mt-2">
                                    {item.date ? new Date(item.date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : 'Previous'}
                                </p>
                            </div>
                        </div>
                        <div className="order-1 md:order-2 flex justify-start relative">
                            <div className={cn(
                                "w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 relative mt-1.5",
                                item.type === 'role_change' ? "bg-indigo-500" : "bg-slate-400"
                            )} />
                        </div>
                    </div>
                ))}
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}
