import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Check, LogOut, RefreshCw, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface OutlookIntegrationStatus {
  connected: boolean;
  email: string | null;
}

export function OutlookSettings() {
  const { toast } = useToast();
  const [status, setStatus] = useState<OutlookIntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    try {
      const response = await fetch('/api/outlook/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch Outlook status:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch Outlook connection status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect() {
    try {
      setLoading(true);
      const response = await fetch('/api/outlook/init-auth');
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.authUrl;
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.message || 'Failed to start Outlook authentication',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to connect Outlook:', error);
      toast({
        title: 'Error',
        description: 'Failed to start Outlook authentication',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDisconnect() {
    try {
      setLoading(true);
      const response = await fetch('/api/outlook/disconnect', { method: 'POST' });
      if (response.ok) {
        setStatus({ connected: false, email: null });
        toast({
          title: 'Disconnected',
          description: 'Outlook calendar disconnected successfully',
        });
      } else {
        throw new Error('Failed to disconnect');
      }
    } catch (error) {
      console.error('Failed to disconnect Outlook:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect Outlook',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setDisconnectDialogOpen(false);
    }
  }

  async function handleSyncAll() {
    try {
      setSyncing(true);
      const response = await fetch('/api/outlook/sync-all', { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Success',
          description: data.message || 'All events synced to Outlook',
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to sync events');
      }
    } catch (error: any) {
      console.error('Failed to sync events:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to sync events to Outlook',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Outlook Calendar Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Outlook Calendar Integration
          </CardTitle>
          <CardDescription>
            Sync your induction review dates and training matrix reviews to your Outlook calendar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status?.connected ? (
            <>
              <Alert className="bg-emerald-50 border-emerald-200">
                <Check className="h-4 w-4 text-emerald-600" />
                <AlertDescription className="text-emerald-800">
                  ✓ Connected to Outlook
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Your calendar events are now synced. Any induction review dates or training matrix reviews you set
                  will automatically appear on your Outlook calendar.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={handleSyncAll}
                  disabled={syncing}
                  className="flex-1"
                >
                  {syncing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sync All Events Now
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setDisconnectDialogOpen(true)}
                  disabled={loading}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            </>
          ) : (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Not yet connected to Outlook. Click the button below to connect your calendar.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleConnect}
                disabled={loading}
                className="w-full"
              >
                Connect to Outlook
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={disconnectDialogOpen} onOpenChange={setDisconnectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect Outlook?</DialogTitle>
            <DialogDescription>
              This will prevent future calendar events from being synced. Any events already synced will remain in your
              Outlook calendar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisconnectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDisconnect} disabled={loading}>
              {loading ? 'Disconnecting...' : 'Disconnect'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
