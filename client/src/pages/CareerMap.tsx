import { useAuth } from '@/lib/authContext';
import { Layout } from '@/components/Layout';
import { useCareerMilestones, useCareerNodes, useTrainingMatrixForUser, useUserCertificates, useCertificateDefinitions } from '@/lib/hooks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Briefcase, 
  ChevronRight, 
  Star, 
  Trophy, 
  GraduationCap,
  Award,
  Zap,
  BookOpen,
  Target,
} from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

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
  const { data: matrixData } = useTrainingMatrixForUser(currentUser?.id || '');
  const { data: userCerts = [] } = useUserCertificates(currentUser?.id);
  const { data: certDefs = [] } = useCertificateDefinitions();

  if (!currentUser) return null;

  const currentNode = useMemo(() => {
    if (!careerNodes.length) return null;
    const match = careerNodes.find((n: any) => n.title.toLowerCase() === currentUser.jobRole.toLowerCase());
    return match || null;
  }, [careerNodes, currentUser.jobRole]);

  const competencyScore = useMemo(() => {
    if (!matrixData?.ratings) return null;
    const ratings = matrixData.ratings as Record<string, number>;
    const values = Object.values(ratings).filter((v): v is number => typeof v === 'number' && v > 0);
    if (values.length === 0) return null;
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const maxRating = 5;
    return Math.round((avg / maxRating) * 100);
  }, [matrixData]);

  const competencyLabel = useMemo(() => {
    if (competencyScore === null) return null;
    if (competencyScore >= 90) return 'Excellent';
    if (competencyScore >= 75) return 'Good';
    if (competencyScore >= 50) return 'Developing';
    return 'Needs Improvement';
  }, [competencyScore]);

  const certProgress = useMemo(() => {
    if (certDefs.length === 0) return null;
    const earned = userCerts.length;
    const total = certDefs.length;
    return { earned, total, percent: Math.round((earned / total) * 100) };
  }, [userCerts, certDefs]);

  const developmentItems = useMemo(() => {
    if (!currentNode) return [];
    const reqs = (currentNode as any).requirements || [];
    if (!Array.isArray(reqs) || reqs.length === 0) return [];
    return reqs
      .filter((r: any) => {
        if (!r.certificateId) return true;
        return !userCerts.some((uc: any) => String(uc.certificateDefinitionId) === String(r.certificateId));
      })
      .map((r: any) => r.description)
      .filter(Boolean);
  }, [currentNode, userCerts]);

  const historyTimeline = useMemo(() => {
    const milestonesTimeline = milestones.map((m: any) => ({
      type: 'milestone',
      id: m.id,
      title: m.title,
      description: m.description,
      date: m.date,
      icon: getMilestoneIcon(m.title)
    }));

    return milestonesTimeline.sort((a: any, b: any) => {
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return 0;
    });
  }, [milestones]);

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground">Your Career Journey</h1>
            <p className="text-lg text-muted-foreground mt-1">
              Track your growth and development at LVC
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary/20 to-transparent -translate-x-1/2 z-0" />

          <div className="space-y-12 relative z-10">

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
                                    <CardTitle className="text-2xl" data-testid="text-current-role">
                                      {currentNode ? currentNode.title : currentUser.jobRole || 'Not Assigned'}
                                    </CardTitle>
                                    <CardDescription className="text-base">
                                      {currentNode ? (currentNode as any).department : currentUser.department || ''}
                                    </CardDescription>
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
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100" data-testid="metric-competency">
                                        <p className="text-xs text-muted-foreground mb-1">Skills</p>
                                        {competencyScore !== null ? (
                                          <>
                                            <div className="flex items-end gap-2">
                                                <span className="text-xl font-bold text-slate-800">{competencyScore}%</span>
                                                <span className={cn("text-xs mb-1", competencyScore >= 75 ? "text-emerald-600" : competencyScore >= 50 ? "text-amber-600" : "text-red-600")}>
                                                  {competencyLabel}
                                                </span>
                                            </div>
                                            <Progress value={competencyScore} className="h-1 mt-2" />
                                          </>
                                        ) : (
                                          <p className="text-sm text-muted-foreground mt-1">No assessment yet</p>
                                        )}
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100" data-testid="metric-certificates">
                                        <p className="text-xs text-muted-foreground mb-1">Certificates</p>
                                        {certProgress ? (
                                          <>
                                            <div className="flex items-end gap-2">
                                                <span className="text-xl font-bold text-slate-800">{certProgress.earned}/{certProgress.total}</span>
                                                <span className="text-xs text-slate-500 mb-1">Earned</span>
                                            </div>
                                            <Progress value={certProgress.percent} className="h-1 mt-2" />
                                          </>
                                        ) : (
                                          <p className="text-sm text-muted-foreground mt-1">No certificates yet</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                                    <BookOpen className="w-4 h-4 text-blue-500" />
                                    Development Focus
                                </h4>
                                {developmentItems.length > 0 ? (
                                  <div className="space-y-2">
                                      {developmentItems.map((item: string, idx: number) => (
                                        <div key={idx} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 transition-colors group/item">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            <span className="text-sm text-slate-600 group-hover/item:text-slate-900 flex-1">{item}</span>
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover/item:text-slate-500" />
                                        </div>
                                      ))}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-3 p-3 rounded-md bg-slate-50 border border-slate-100">
                                    <Target className="w-4 h-4 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                      {currentNode ? 'All requirements met for current role' : 'No development goals set yet'}
                                    </p>
                                  </div>
                                )}
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

            <div className="space-y-8 pb-8">
                {historyTimeline.length > 0 ? (
                  historyTimeline.map((item: any, index: number) => (
                    <div key={index} className="grid md:grid-cols-2 gap-8 items-start opacity-70 hover:opacity-100 transition-opacity">
                        <div className="order-2 md:order-1 flex justify-start md:justify-end">
                            <div className="text-left md:text-right max-w-sm">
                                <h4 className="font-semibold text-slate-800">{item.title}</h4>
                                <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                                <p className="text-xs text-slate-400 mt-2">
                                    {item.date ? new Date(item.date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : ''}
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
                  ))
                ) : (
                  <div className="grid md:grid-cols-2 gap-8 items-start">
                    <div className="order-2 md:order-1 flex justify-start md:justify-end">
                      <div className="text-left md:text-right max-w-sm p-4 rounded-lg border border-dashed border-slate-200 bg-slate-50/50">
                        <p className="text-sm text-muted-foreground">
                          No career milestones recorded yet. Your career history will appear here as milestones are added.
                        </p>
                      </div>
                    </div>
                    <div className="order-1 md:order-2 flex justify-start relative">
                      <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 relative mt-1.5 bg-slate-300" />
                    </div>
                  </div>
                )}
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}
