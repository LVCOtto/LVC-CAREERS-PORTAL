import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/authContext';
import { roleDefinitions, getRoleById, getRoleOptions } from '@/lib/roleStandardsData';
import { FileText, Building2, Calendar, Hash } from 'lucide-react';

export default function RolePlaybook() {
  const { currentUser } = useAuth();
  const isManager = currentUser?.role === 'manager' || currentUser?.role === 'admin';
  
  const defaultRoleId = currentUser?.jobRole 
    ? Object.keys(roleDefinitions).find(id => 
        roleDefinitions[id].title.toLowerCase() === currentUser.jobRole.toLowerCase()
      ) || 'field-service-engineer'
    : 'field-service-engineer';
  
  const [selectedRoleId, setSelectedRoleId] = useState(defaultRoleId);
  const currentRoleStandards = getRoleById(selectedRoleId);
  const roleOptions = getRoleOptions();

  if (!currentRoleStandards) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Role standards not found.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Role Standards Playbook</h1>
            <p className="text-muted-foreground mt-1">
              Complete role specifications and responsibilities
            </p>
          </div>
        </div>

        {isManager && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">View Role</CardTitle>
              <CardDescription>Select a role to view its standards</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger className="w-full max-w-md" data-testid="select-role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <span className="flex items-center gap-2">
                        {role.label}
                        <span className="text-xs text-muted-foreground">({role.department})</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        <Card className="overflow-hidden">
          <CardHeader className="bg-primary/5 border-b">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">{currentRoleStandards.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {currentRoleStandards.department}
                    </span>
                    {currentRoleStandards.version && (
                      <span className="flex items-center gap-1">
                        <Hash className="h-3.5 w-3.5" />
                        v{currentRoleStandards.version}
                      </span>
                    )}
                    {currentRoleStandards.lastReviewed && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Reviewed {currentRoleStandards.lastReviewed}
                      </span>
                    )}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-background">
                {currentRoleStandards.sections.reduce((acc, s) => acc + s.standards.length, 0)} Standards
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-8">
              {currentRoleStandards.sections.map((section, sectionIdx) => (
                <div key={section.id}>
                  <h3 className="font-semibold text-base mb-3 text-primary">{section.name}</h3>
                  
                  <ul className="space-y-2">
                    {section.standards.map((standard) => (
                      <li 
                        key={standard.id} 
                        className="flex items-start gap-2 text-sm"
                        data-testid={`standard-${standard.id}`}
                      >
                        <span className="text-primary mt-1">•</span>
                        <span>{standard.text}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {sectionIdx < currentRoleStandards.sections.length - 1 && (
                    <Separator className="mt-6" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
