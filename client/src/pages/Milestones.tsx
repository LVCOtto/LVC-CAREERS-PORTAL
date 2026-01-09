import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { careerMilestones, certificates, Certificate } from '@/lib/mockData';
import {
  Award,
  Briefcase,
  GraduationCap,
  Star,
  Trophy,
  FileCheck,
  Shield,
  Wrench,
  BadgeCheck,
  ClipboardCheck,
  Calendar,
  Download,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';

export default function Milestones() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('milestones');

  if (!currentUser) return null;

  const userMilestones = careerMilestones.filter(m => m.userId === currentUser.id);
  const userCertificates = certificates.filter(c => c.userId === currentUser.id);

  const getMilestoneIcon = (title: string) => {
    if (title.toLowerCase().includes('joined')) return <Briefcase className="w-5 h-5" />;
    if (title.toLowerCase().includes('promotion')) return <Trophy className="w-5 h-5" />;
    if (title.toLowerCase().includes('induction')) return <GraduationCap className="w-5 h-5" />;
    if (title.toLowerCase().includes('award')) return <Award className="w-5 h-5" />;
    return <Star className="w-5 h-5" />;
  };

  const getCategoryIcon = (category: Certificate['category']) => {
    switch (category) {
      case 'safety': return <Shield className="w-4 h-4" />;
      case 'technical': return <Wrench className="w-4 h-4" />;
      case 'professional': return <BadgeCheck className="w-4 h-4" />;
      case 'compliance': return <ClipboardCheck className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: Certificate['category']) => {
    switch (category) {
      case 'safety': return 'bg-blue-100 text-blue-700';
      case 'technical': return 'bg-purple-100 text-purple-700';
      case 'professional': return 'bg-emerald-100 text-emerald-700';
      case 'compliance': return 'bg-amber-100 text-amber-700';
    }
  };

  const getStatusBadge = (status: Certificate['status']) => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Valid</Badge>;
      case 'expiring_soon':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1"><AlertTriangle className="w-3 h-3" />Expiring Soon</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
    }
  };

  const validCerts = userCertificates.filter(c => c.status === 'valid').length;
  const expiringCerts = userCertificates.filter(c => c.status === 'expiring_soon').length;
  const expiredCerts = userCertificates.filter(c => c.status === 'expired').length;

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Career Milestones & Certificates</h1>
          <p className="text-muted-foreground mt-1">
            Your professional achievements, career highlights, and certifications
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="milestones" className="gap-2" data-testid="tab-milestones">
              <Trophy className="h-4 w-4" />
              Career Milestones
            </TabsTrigger>
            <TabsTrigger value="certificates" className="gap-2" data-testid="tab-certificates">
              <FileCheck className="h-4 w-4" />
              Certificates
              {expiringCerts > 0 && (
                <Badge variant="secondary" className="ml-1 bg-amber-100 text-amber-700">
                  {expiringCerts}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

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

            <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-accent/5 mt-6">
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
          </TabsContent>

          <TabsContent value="certificates">
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{userCertificates.length}</p>
                      <p className="text-xs text-muted-foreground">Total Certificates</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-emerald-200 bg-emerald-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <BadgeCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-700">{validCerts}</p>
                      <p className="text-xs text-muted-foreground">Valid</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-amber-200 bg-amber-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-amber-700">{expiringCerts}</p>
                      <p className="text-xs text-muted-foreground">Expiring Soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-red-200 bg-red-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                      <FileCheck className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-700">{expiredCerts}</p>
                      <p className="text-xs text-muted-foreground">Expired</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              {userCertificates.map(cert => (
                <Card key={cert.id} className={`${cert.status === 'expiring_soon' ? 'border-amber-300' : cert.status === 'expired' ? 'border-red-300' : ''}`} data-testid={`certificate-${cert.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getCategoryColor(cert.category)}`}>
                          {getCategoryIcon(cert.category)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{cert.name}</h3>
                          <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            <Badge variant="outline" className="text-xs gap-1">
                              <Calendar className="w-3 h-3" />
                              Issued: {new Date(cert.issueDate).toLocaleDateString('en-GB')}
                            </Badge>
                            {cert.expiryDate && (
                              <Badge variant="outline" className={`text-xs gap-1 ${cert.status === 'expiring_soon' ? 'border-amber-300 text-amber-700' : ''}`}>
                                <Calendar className="w-3 h-3" />
                                Expires: {new Date(cert.expiryDate).toLocaleDateString('en-GB')}
                              </Badge>
                            )}
                            {cert.credentialId && (
                              <span className="text-xs text-muted-foreground">
                                ID: {cert.credentialId}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(cert.status)}
                        <Button variant="outline" size="sm" className="gap-1" data-testid={`button-view-cert-${cert.id}`}>
                          <ExternalLink className="w-3 h-3" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1" data-testid={`button-download-cert-${cert.id}`}>
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {userCertificates.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileCheck className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="font-display text-lg font-semibold mb-2">No certificates yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Your certificates will appear here as you complete training courses.
                      Certificates are automatically added when you complete e-learning or attend certified training.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            <Card className="mt-6 bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Certificate Management</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Certificates are automatically synced from training providers like i-Hasco. 
                      If you have external certifications to add, please contact your manager.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
