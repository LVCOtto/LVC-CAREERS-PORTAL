import { useState } from "react";
import { RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useResetTrainingMatrix } from "@/lib/hooks";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/authContext";

export function ResetTrainingMatrixButton({ userId, userName, compact = false, onReset }: {
  userId: string;
  userName: string;
  compact?: boolean;
  onReset?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const reset = useResetTrainingMatrix();
  const { toast } = useToast();
  const { currentUser } = useAuth();

  if (currentUser?.role !== "manager" && currentUser?.role !== "admin") return null;

  async function confirmReset() {
    try {
      await reset.mutateAsync(userId);
      setOpen(false);
      onReset?.();
      toast({
        title: "Blank assessment created",
        description: `${userName} can start again. Submitted history is preserved; the overview retains the last submitted score until a new submission.`,
      });
    } catch (error) {
      toast({ title: "Could not reset assessment", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    }
  }

  return <>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant={compact ? "ghost" : "outline"} size={compact ? "icon" : "sm"}
          className={compact ? "h-7 w-7" : "gap-2"}
          aria-label={`Reset training matrix for ${userName}`}
          data-testid={`button-reset-matrix-${userId}`}
          disabled={reset.isPending} onClick={() => setOpen(true)}>
          <RotateCcw className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
          {!compact && "Reset assessment"}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Start a blank assessment; keep submitted history</TooltipContent>
    </Tooltip>
    <Dialog open={open} onOpenChange={value => { if (!reset.isPending) setOpen(value); }}>
      <DialogContent className="sm:max-w-md" data-testid={`dialog-reset-matrix-${userId}`}>
        <DialogHeader>
          <DialogTitle>Reset {userName}'s training matrix?</DialogTitle>
          <DialogDescription>A new blank draft will start with no selected ratings.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Submitted results and approved history will not be deleted. Any existing draft or assessment awaiting sign-off will be marked superseded and kept read-only in history.</p>
          <p>The previous review due date is retained. This does not send an email or mark a request as sent. Copy the new draft's link when you are ready to share it.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" disabled={reset.isPending} onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" disabled={reset.isPending} onClick={confirmReset}
            data-testid={`button-confirm-reset-matrix-${userId}`}>
            {reset.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Start blank assessment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>;
}
