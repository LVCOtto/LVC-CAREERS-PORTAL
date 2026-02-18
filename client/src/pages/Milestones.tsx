import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { useCertificates, CertificateDefinition } from '@/lib/certificatesContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { careerMilestones } from '@/lib/mockData';
import {
  Award,
  Briefcase,
  GraduationCap,
  Star,
  Trophy,
  FileCheck,
  ShieldCheck,
  Wrench,
  HeartHandshake,
  Layers,
  Stethoscope,
  Droplets,
  Users,
  Zap,
  BadgeCheck,
  Medal,
  Calendar,
  Download,
  ExternalLink,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ElementType> = {
  'shield-check': ShieldCheck,
  'wrench': Wrench,
  'heart-handshake': HeartHandshake,
  'layers': Layers,
  'stethoscope': Stethoscope,
  'droplets': Droplets,
  'users': Users,
  'award': Award,
  'zap': Zap,
  'badge-check': BadgeCheck,
  'medal': Medal,
  'star': Star
};

function CertificateBadge({ 
  definition, 
  userCert, 
  locked = false 
}: { 
  definition: CertificateDefinition; 
  userCert?: any; 
  locked?: boolean 
}) {
  const Icon = iconMap[definition.icon] || Award;
  
  // Visual styles based on level
  let badgeStyle = "bg-slate-100 border-slate-300 text-slate-500"; // Standard/Locked default
  let iconStyle = "text-slate-400";
  let shineEffect = "";

  if (!locked) {
    switch (definition.level) {
      case 'Bronze':
        badgeStyle = "bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300 text-orange-800 shadow-orange-100";
        iconStyle = "text-orange-700 drop-shadow-sm";
        break;
      case 'Silver':
        badgeStyle = "bg-gradient-to-br from-slate-100 to-slate-300 border-slate-300 text-slate-800 shadow-slate-200";
        iconStyle = "text-slate-700 drop-shadow-sm";
        shineEffect = "after:absolute after:inset-0 after:bg-gradient-to-tr after:from-transparent after:via-white/30 after:to-transparent after:translate-x-[-100%] hover:after:translate-x-[100%] after:transition-transform after:duration-1000 overflow-hidden";
        break;
      case 'Gold':
        badgeStyle = "bg-gradient-to-br from-yellow-100 to-amber-200 border-amber-300 text-amber-900 shadow-amber-100";
        iconStyle = "text-amber-700 drop-shadow-md";
        shineEffect = "after:absolute after:inset-0 after:bg-gradient-to-tr after:from-transparent after:via-white/40 after:to-transparent after:translate-x-[-100%] hover:after:translate-x-[100%] after:transition-transform after:duration-1000 overflow-hidden";
        break;
      case 'Platinum':
        badgeStyle = "bg-gradient-to-br from-cyan-100 to-blue-200 border-blue-300 text-blue-900 shadow-blue-100";
        iconStyle = "text-blue-700 drop-shadow-md";
        shineEffect = "after:absolute after:inset-0 after:bg-gradient-to-tr after:from-transparent after:via-white/50 after:to-transparent after:translate-x-[-100%] hover:after:translate-x-[100%] after:transition-transform after:duration-1000 overflow-hidden";
        break;
      default: // Standard
        badgeStyle = "bg-white border-slate-200 text-slate-700 shadow-sm";
        iconStyle = "text-primary";
    }
  }

  return (
    <div className={cn(
      "relative group flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300",
      locked ? "opacity-60 grayscale bg-slate-50 border-dashed" : `${badgeStyle} shadow-lg hover:-translate-y-1 hover:shadow-xl ${shineEffect}`
    )}>
      <div className={cn(
        "w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110",
        locked ? "bg-slate-200" : "bg-white/50 backdrop-blur-sm"
      )}>
        {locked ? <Lock className="w-6 h-6 text-slate-400" /> : <Icon className={cn("w-8 h-8", iconStyle)} />}
      </div>
      
      <div className="text-center w-full z-10">
        <h3 className="font-bold text-sm leading-tight mb-1">{definition.name}</h3>
        <p className="text-[10px] uppercase tracking-wider font-semibold opacity-70 mb-2">{definition.level}</p>
        
        {!locked && userCert && (
          <div className="mt-2 pt-2 border-t border-black/5 w-full">
             <p className="text-[10px] font-medium opacity-80">
               {new Date(userCert.issueDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
             </p>
             {userCert.status === 'expiring_soon' && (
               <Badge variant="outline" className="mt-1 h-5 text-[10px] bg-amber-100 text-amber-700 border-amber-300 px-1 py-0 w-full justify-center">
                 Expiring
               </Badge>
             )}
          </div>
        )}
      </div>
      
      {/* Tooltip-like overlay on hover could go here, but simple card is nice */}
    </div>
  );
}

export default function Milestones() {
  const { currentUser } = useAuth();
  const { definitions, getUserCertificates } = useCertificates();
  const [activeTab, setActiveTab] = useState('certificates');

  if (!currentUser) return null;

  const userMilestones = careerMilestones.filter(m => m.userId === currentUser.id);
  const myCertificates = getUserCertificates(currentUser.id);
  
  // Group definitions by category
  const categories = Array.from(new Set(definitions.map(d => d.category)));
  
  const getMilestoneIcon = (title: string) => {
    if (title.toLowerCase().includes('joined')) return <Briefcase className="w-5 h-5" />;
    if (title.toLowerCase().includes('promotion')) return <Trophy className="w-5 h-5" />;
    if (title.toLowerCase().includes('induction')) return <GraduationCap className="w-5 h-5" />;
    if (title.toLowerCase().includes('award')) return <Award className="w-5 h-5" />;
    return <Star className="w-5 h-5" />;
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Achievements & Milestones</h1>
          <p className="text-muted-foreground mt-1">
            Track your professional growth, collected badges, and career highlights
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="certificates" className="gap-2" data-testid="tab-certificates">
              <BadgeCheck className="h-4 w-4" />
              Certificates & Badges
            </TabsTrigger>
            <TabsTrigger value="milestones" className="gap-2" data-testid="tab-milestones">
              <Trophy className="h-4 w-4" />
              Career Milestones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="certificates">
            <div className="grid gap-8">
              {categories.map(category => {
                const categoryDefs = definitions.filter(d => d.category === category);
                if (categoryDefs.length === 0) return null;

                return (
                  <div key={category} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-display font-bold text-foreground">{category}</h2>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {categoryDefs.map(def => {
                        const userCert = myCertificates.find(uc => uc.definitionId === def.id);
                        return (
                          <CertificateBadge 
                            key={def.id} 
                            definition={def} 
                            userCert={userCert} 
                            locked={!userCert} 
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-12 p-6 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-4">
               <div className="p-3 bg-primary/10 rounded-full">
                 <Zap className="w-6 h-6 text-primary" />
               </div>
               <div>
                 <h3 className="font-bold text-lg">Level Up Your Career</h3>
                 <p className="text-muted-foreground mt-1">
                   Collect more badges by completing training modules and external certifications. 
                   Talk to your manager about your development plan to unlock new tiers.
                 </p>
               </div>
            </div>
          </TabsContent>

          <TabsContent value="milestones">
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Award className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Your Journey</CardTitle>
                    <CardDescription>
                      Started at LVC on {new Date(currentUser.startDate).toLocaleDateString('en-GB')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {userMilestones.length > 0 ? (
                  <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
                    <div className="space-y-6">
                      {userMilestones.map((milestone, index) => (
                        <div
                          key={milestone.id}
                          className="relative pl-14 animate-slide-in-right"
                          style={{ animationDelay: `${index * 100}ms` }}
                          data-testid={`milestone-${milestone.id}`}
                        >
                          <div className="absolute left-3 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            {getMilestoneIcon(milestone.title)}
                          </div>
                          <Card className="border-border/50">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold">{milestone.title}</h3>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {milestone.description}
                                  </p>
                                </div>
                                <span className="text-sm text-muted-foreground whitespace-nowrap ml-4">
                                  {new Date(milestone.date).toLocaleDateString('en-GB')}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Award className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="font-display text-lg font-semibold mb-2">No milestones yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Your career milestones will appear here as you progress through your journey at
                      LVC. Complete your induction and training to earn your first milestones!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
