import { useState } from "react";
import { Link, Redirect } from "wouter";
import { Check, Copy, ExternalLink, Loader2, Send, RefreshCw, Search } from "lucide-react";
import { differenceInCalendarDays, format } from "date-fns";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/lib/authContext";
import { useTeamTraining, useMarkTrainingSent, useGenerateShareTokenForUser } from "@/lib/hooks";
import { buildTeamMemberHref } from "@/lib/teamRoutes";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { TeamTrainingRow, TeamTrainingStatus } from "@shared/teamTraining";
import { ResetTrainingMatrixButton } from "@/components/ResetTrainingMatrixButton";

const statusLabels: Record<TeamTrainingStatus, string> = {
  never_completed: "Never completed", expired: "Expired", awaiting_signoff: "Awaiting sign-off",
  review_missing: "Review date missing", current: "Current",
};

function displayDate(value: string | null) {
  return value ? format(new Date(value.length === 10 ? `${value}T00:00:00` : value), "dd MMM yyyy") : "-";
}

function IconAction({ label, children }: { label: string; children: React.ReactElement }) {
  return <Tooltip><TooltipTrigger asChild>{children}</TooltipTrigger><TooltipContent>{label}</TooltipContent></Tooltip>;
}

export default function TeamTraining() {
  const { currentUser } = useAuth();
  const allowed = currentUser?.role === "manager" || currentUser?.role === "admin";
  const query = useTeamTraining(currentUser?.id ?? "", allowed);
  const share = useGenerateShareTokenForUser();
  const markSent = useMarkTrainingSent();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [copying, setCopying] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [sentMember, setSentMember] = useState<TeamTrainingRow | null>(null);
  const [fallbackLink, setFallbackLink] = useState("");

  if (!allowed) return <Redirect to="/dashboard" />;

  const members = query.data ?? [];
  const counts = {
    attention: members.filter((member) => member.needsAttention).length,
    response: members.filter((member) => member.awaitingResponse).length,
    signoff: members.filter((member) => member.awaitingSignoff).length,
  };
  const visible = members.filter((member) => member.name.toLowerCase().includes(search.trim().toLowerCase())
    && (filter === "all" || (filter === "attention" && member.needsAttention)
      || (filter === "response" && member.awaitingResponse) || (filter === "signoff" && member.awaitingSignoff)));

  async function copyLink(member: TeamTrainingRow) {
    setCopying(member.userId);
    setCopied(null);
    try {
      const { token } = await share.mutateAsync(member.userId);
      const url = `${window.location.origin}/training-matrix/shared/${token}`;
      try {
        await navigator.clipboard.writeText(url);
        setCopied(member.userId);
        toast({ title: "Link copied", description: member.name });
      } catch {
        setFallbackLink(url);
      }
    } catch (error) {
      toast({ title: "Could not get training link", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    } finally {
      setCopying(null);
    }
  }

  async function confirmSent() {
    if (!sentMember) return;
    try {
      await markSent.mutateAsync(sentMember.userId);
      toast({ title: "Request marked as sent", description: sentMember.name });
      setSentMember(null);
    } catch (error) {
      toast({ title: "Could not record sent date", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    }
  }

  return (
    <Layout>
      <div className="space-y-4 animate-fade-in min-w-0">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-display text-3xl font-bold">Training</h1>
          <IconAction label="Refresh training overview">
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Refresh training overview" disabled={query.isFetching} onClick={() => query.refetch()}>
              <RefreshCw className={cn("h-4 w-4", query.isFetching && "animate-spin")} />
            </Button>
          </IconAction>
        </div>
        {!query.isLoading && !query.isError && <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm tabular-nums" data-testid="training-summary">
          <span><strong>{members.length}</strong> team members</span>
          <span className={counts.attention ? "text-destructive" : "text-muted-foreground"}><strong>{counts.attention}</strong> need attention</span>
          <span className="text-muted-foreground"><strong>{counts.response}</strong> awaiting response</span>
          <span className="text-muted-foreground"><strong>{counts.signoff}</strong> awaiting sign-off</span>
        </div>}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input aria-label="Search team members" placeholder="Search names" className="h-9 pl-9" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="h-9 w-[205px]" aria-label="Filter training status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="attention">Needs attention</SelectItem>
              <SelectItem value="response">Awaiting response</SelectItem>
              <SelectItem value="signoff">Awaiting sign-off</SelectItem>
            </SelectContent>
          </Select>
          {!query.isLoading && !query.isError && <span className="text-xs text-muted-foreground sm:ml-auto">{visible.length} of {members.length}</span>}
        </div>
        {query.isLoading ? <div className="flex justify-center py-16" role="status" aria-label="Loading training"><Loader2 className="h-6 w-6 animate-spin" /></div>
          : query.isError ? <div role="alert" className="border-y py-6 text-sm space-y-3"><p>Unable to load team training.</p><Button variant="outline" onClick={() => query.refetch()}><RefreshCw className="h-4 w-4 mr-2" />Retry</Button></div>
          : <div className="max-h-[calc(100dvh-260px)] overflow-auto border-y" data-testid="training-table-scroll">
            <table className="w-full min-w-[900px] text-left text-xs" aria-label="Team training overview">
              <thead className="sticky top-0 z-10 bg-background shadow-sm">
                <tr className="h-9 border-b text-muted-foreground [&>th]:px-3 [&>th]:font-medium [&>th]:whitespace-nowrap">
                  <th scope="col">Team Member</th><th scope="col">Status</th><th scope="col">Last Submitted</th>
                  <th scope="col" className="text-right">Score</th><th scope="col">Review Due</th><th scope="col">Request Sent</th>
                  <th scope="col" className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((member) => <tr key={member.userId} className="h-10 border-b last:border-0 hover:bg-muted/40 [&>td]:px-3 [&>td]:py-1 [&>td]:whitespace-nowrap" data-testid={`training-row-${member.userId}`}>
                  <td><Link href={buildTeamMemberHref(member.userId)} className={cn("font-medium hover:underline", member.needsAttention && "text-destructive")}>
                    {member.name}
                  </Link></td>
                  <td className={cn(member.needsAttention ? "text-destructive" : member.status === "current" ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground")}>
                    <span title={member.awaitingSignoff && member.status === "expired" ? "Previous assessment expired; replacement awaiting sign-off" : statusLabels[member.status]}>{statusLabels[member.status]}</span>
                    {member.awaitingSignoff && member.status === "expired" && <span className="ml-2 text-muted-foreground">/ Awaiting sign-off</span>}
                  </td>
                  <td className="tabular-nums">{member.lastSubmitted ? displayDate(member.lastSubmitted) : member.status === "never_completed" ? "Never" : "-"}</td>
                  <td className="text-right tabular-nums">{member.score === null ? "-" : `${member.score.toFixed(1)} / 4`}</td>
                  <td className="tabular-nums">{displayDate(member.reviewDue)}</td>
                  <td className="tabular-nums">
                    {member.requestSent ? <Tooltip><TooltipTrigger asChild><span className="cursor-default" tabIndex={0}>
                      {displayDate(member.requestSent)}
                    </span></TooltipTrigger><TooltipContent>Awaiting response for {Math.max(0, differenceInCalendarDays(new Date(), new Date(member.requestSent)))} days</TooltipContent></Tooltip> : "-"}
                  </td>
                  <td><div className="flex justify-end gap-0.5">
                    <IconAction label={copied === member.userId ? "Link copied" : "Copy training matrix link"}>
                      <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Copy training matrix link for ${member.name}`} disabled={copying !== null} onClick={() => copyLink(member)}>
                        {copying === member.userId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : copied === member.userId ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    </IconAction>
                    <IconAction label="Open training details">
                      <Button variant="ghost" size="icon" className="h-7 w-7" asChild><Link href={`${buildTeamMemberHref(member.userId)}?tab=training`} aria-label={`Open training details for ${member.name}`}><ExternalLink className="h-3.5 w-3.5" /></Link></Button>
                    </IconAction>
                    <IconAction label={member.awaitingResponse ? "Mark reminder as sent today" : "Mark request as sent today"}>
                      <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Mark request as sent for ${member.name}`} onClick={() => setSentMember(member)}><Send className="h-3.5 w-3.5" /></Button>
                    </IconAction>
                    <ResetTrainingMatrixButton userId={member.userId} userName={member.name} compact onReset={() => {
                      setCopied(null);
                      setFallbackLink("");
                    }} />
                  </div></td>
                </tr>)}
                {!visible.length && <tr><td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">{members.length ? "No matching team members." : "No team members assigned."}</td></tr>}
              </tbody>
            </table>
          </div>}
      </div>
      <Dialog open={!!sentMember} onOpenChange={(open) => { if (!open && !markSent.isPending) setSentMember(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Mark request as sent?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Confirm you sent {sentMember?.name}'s training link today. No email will be sent by the portal.</p>
          {sentMember?.awaitingResponse && <p className="text-sm text-muted-foreground">This replaces the previous request date of {displayDate(sentMember.requestSent)}.</p>}
          <DialogFooter><Button variant="outline" disabled={markSent.isPending} onClick={() => setSentMember(null)}>Cancel</Button>
            <Button disabled={markSent.isPending} onClick={confirmSent}>{markSent.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}Mark as sent</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!fallbackLink} onOpenChange={(open) => { if (!open) setFallbackLink(""); }}>
        <DialogContent><DialogHeader><DialogTitle>Training matrix link</DialogTitle></DialogHeader>
          <Input aria-label="Training matrix share link" value={fallbackLink} readOnly onFocus={(event) => event.target.select()} />
        </DialogContent>
      </Dialog>
    </Layout>
  );
}