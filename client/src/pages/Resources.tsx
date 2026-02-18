import { useAuth } from '@/lib/authContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useResources } from '@/lib/resourcesContext';
import { useState } from 'react';
import {
  BookOpen,
  ShieldCheck,
  Lock,
  Gift,
  Calendar,
  Receipt,
  GraduationCap,
  Globe,
  Network,
  Headphones,
  Search,
  ExternalLink,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  'book-open': <BookOpen className="w-6 h-6" />,
  'shield-check': <ShieldCheck className="w-6 h-6" />,
  'lock': <Lock className="w-6 h-6" />,
  'gift': <Gift className="w-6 h-6" />,
  'calendar': <Calendar className="w-6 h-6" />,
  'receipt': <Receipt className="w-6 h-6" />,
  'graduation-cap': <GraduationCap className="w-6 h-6" />,
  'globe': <Globe className="w-6 h-6" />,
  'network': <Network className="w-6 h-6" />,
  'headphones': <Headphones className="w-6 h-6" />,
};

export default function Resources() {
  const { currentUser } = useAuth();
  const { resources } = useResources();
  const [searchQuery, setSearchQuery] = useState('');

  if (!currentUser) return null;

  const categories = Array.from(new Set(resources.map(r => r.category)));

  const filteredResources = resources.filter(
    r =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getResourcesByCategory = (category: string) =>
    filteredResources.filter(r => r.category === category);

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Resources</h1>
            <p className="text-muted-foreground mt-1">
              Access company documents, policies, and useful links
            </p>
          </div>
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-resources"
            />
          </div>
        </div>

        {categories.map(category => {
          const categoryResources = getResourcesByCategory(category);
          if (categoryResources.length === 0) return null;

          return (
            <div key={category}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="font-display text-xl font-semibold">{category}</h2>
                <Badge variant="secondary">{categoryResources.length}</Badge>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryResources.map(resource => (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                    data-testid={`resource-link-${resource.id}`}
                  >
                    <Card className="h-full border-border/50 hover:border-primary/50 hover:shadow-md transition-all duration-200 group-hover:-translate-y-0.5">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            {iconMap[resource.icon] || <BookOpen className="w-6 h-6" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                                {resource.title}
                              </h3>
                              <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {resource.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>
            </div>
          );
        })}

        {filteredResources.length === 0 && (
          <Card className="border-border/50">
            <CardContent className="py-12 text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">No resources found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search query to find what you're looking for.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
