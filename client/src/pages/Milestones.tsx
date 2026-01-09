import { useAuth } from '@/lib/authContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { careerMilestones, getUserById } from '@/lib/mockData';
import { Award, Briefcase, GraduationCap, Star, Trophy } from 'lucide-react';

export default function Milestones() {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  const userMilestones = careerMilestones.filter(m => m.userId === currentUser.id);

  const getMilestoneIcon = (title: string) => {
    if (title.toLowerCase().includes('joined')) return <Briefcase className="w-5 h-5" />;
    if (title.toLowerCase().includes('promotion')) return <Trophy className="w-5 h-5" />;
    if (title.toLowerCase().includes('induction')) return <GraduationCap className="w-5 h-5" />;
    if (title.toLowerCase().includes('award')) return <Award className="w-5 h-5" />;
    return <Star className="w-5 h-5" />;
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Career Milestones</h1>
          <p className="text-muted-foreground mt-1">
            Your professional achievements and career highlights at LVC
          </p>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Your Journey</CardTitle>
                <CardDescription>
                  Started at LVC on {new Date(currentUser.startDate).toLocaleDateString()}
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
                              {new Date(milestone.date).toLocaleDateString()}
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

        <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold mb-1">Keep Growing</h3>
                <p className="text-muted-foreground">
                  Complete your training requirements and take on new challenges to unlock more
                  career milestones. Your manager can help identify development opportunities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
