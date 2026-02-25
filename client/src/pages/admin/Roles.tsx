import { useAuth } from '@/lib/authContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Plus, Edit, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useJobRoles } from '@/lib/hooks';
import { Spinner } from '@/components/ui/spinner';

export default function AdminRoles() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { data: jobRoles = [], isLoading } = useJobRoles();

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  const handleEdit = (roleTitle: string) => {
    toast({
      title: 'Edit job role',
      description: `Editing ${roleTitle} role.`,
    });
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Job Roles</h1>
            <p className="text-muted-foreground mt-1">
              Define job roles and their responsibilities
            </p>
          </div>
          <Button data-testid="button-add-role">
            <Plus className="w-4 h-4 mr-2" />
            Add Job Role
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {jobRoles.map((role: any) => (
              <Card key={role.id} className="border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{role.title}</CardTitle>
                        <CardDescription>{role.department}</CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(role.title)}
                      data-testid={`button-edit-role-${role.id}`}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {role.summary && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Summary</h4>
                        <p className="text-sm">{role.summary}</p>
                      </div>
                    )}
                    {role.responsibilities && role.responsibilities.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">
                          Key Responsibilities
                        </h4>
                        <ul className="space-y-1">
                          {role.responsibilities.map((resp: string, idx: number) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              {resp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Badge variant="outline">
                        <Users className="w-3 h-3 mr-1" />
                        Linked Templates
                      </Badge>
                      <Badge variant="secondary">Induction</Badge>
                      <Badge variant="secondary">Training Matrix</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
