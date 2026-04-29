import { db } from "./db";
import { outlookIntegrations, calendarSyncLog, inductionItemCompletions, trainingMatrixSubmissions } from "../shared/schema";
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  refreshAccessToken,
  CalendarEvent,
} from "./outlookAuth";
import { eq, and } from "drizzle-orm";

const TIMEZONE = "Europe/London"; // Adjust based on your location

interface SyncEvent {
  userId: string;
  sourceType: "induction_category" | "training_matrix";
  sourceId: string;
  eventTitle: string;
  eventDate: string; // ISO date string (YYYY-MM-DD)
  description?: string;
}

// Convert date string (YYYY-MM-DD) to full day event in Outlook
function createFullDayEvent(title: string, date: string, description?: string): CalendarEvent {
  return {
    subject: title,
    start: {
      dateTime: `${date}T00:00:00`,
      timeZone: TIMEZONE,
    },
    end: {
      dateTime: `${date}T23:59:59`,
      timeZone: TIMEZONE,
    },
    categories: ["LVC Portal"],
    description:
      description || "Event synchronized from LVC Careers Portal",
    isReminderOn: true,
    reminderMinutesBeforeStart: 24 * 60, // 24 hours before
  };
}

async function ensureValidAccessToken(userId: string): Promise<string | null> {
  const integration = await db.query.outlookIntegrations.findFirst({
    where: eq(outlookIntegrations.userId, userId),
  });

  if (!integration || !integration.isEnabled) {
    return null;
  }

  // Check if token is expired
  const expiresAt = new Date(integration.expiresAt);
  if (expiresAt < new Date()) {
    // Token expired, refresh it
    try {
      const newToken = await refreshAccessToken(integration.refreshToken);
      await db
        .update(outlookIntegrations)
        .set({
          accessToken: newToken.accessToken,
          refreshToken: newToken.refreshToken,
          expiresAt: newToken.expiresAt,
          updatedDate: new Date().toISOString(),
        })
        .where(eq(outlookIntegrations.userId, userId));
      return newToken.accessToken;
    } catch (error) {
      console.error(`Failed to refresh token for user ${userId}:`, error);
      // Mark as disabled if refresh fails
      await db
        .update(outlookIntegrations)
        .set({ isEnabled: false })
        .where(eq(outlookIntegrations.userId, userId));
      return null;
    }
  }

  return integration.accessToken;
}

export async function syncEventToOutlook(event: SyncEvent): Promise<void> {
  const accessToken = await ensureValidAccessToken(event.userId);
  if (!accessToken) {
    console.warn(`No valid Outlook integration for user ${event.userId}`);
    return;
  }

  try {
    // Check if event already synced
    const existingSync = await db.query.calendarSyncLog.findFirst({
      where: and(
        eq(calendarSyncLog.userId, event.userId),
        eq(calendarSyncLog.sourceType, event.sourceType),
        eq(calendarSyncLog.sourceId, event.sourceId)
      ),
    });

    const calendarEvent = createFullDayEvent(event.eventTitle, event.eventDate, event.description);

    if (existingSync) {
      // Update existing event
      await updateCalendarEvent(accessToken, existingSync.outlookEventId, calendarEvent);
      await db
        .update(calendarSyncLog)
        .set({
          eventTitle: event.eventTitle,
          eventDate: event.eventDate,
          lastUpdated: new Date().toISOString(),
        })
        .where(eq(calendarSyncLog.id, existingSync.id));
    } else {
      // Create new event
      const outlookEventId = await createCalendarEvent(accessToken, calendarEvent);
      await db.insert(calendarSyncLog).values({
        userId: event.userId,
        sourceType: event.sourceType,
        sourceId: event.sourceId,
        outlookEventId,
        eventTitle: event.eventTitle,
        eventDate: event.eventDate,
        syncedDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error(`Failed to sync event to Outlook for user ${event.userId}:`, error);
    throw error;
  }
}

export async function removeEventFromOutlook(
  userId: string,
  sourceType: "induction_category" | "training_matrix",
  sourceId: string
): Promise<void> {
  const accessToken = await ensureValidAccessToken(userId);
  if (!accessToken) {
    return;
  }

  try {
    const syncLog = await db.query.calendarSyncLog.findFirst({
      where: and(
        eq(calendarSyncLog.userId, userId),
        eq(calendarSyncLog.sourceType, sourceType),
        eq(calendarSyncLog.sourceId, sourceId)
      ),
    });

    if (syncLog) {
      await deleteCalendarEvent(accessToken, syncLog.outlookEventId);
      await db.delete(calendarSyncLog).where(eq(calendarSyncLog.id, syncLog.id));
    }
  } catch (error) {
    console.error(`Failed to remove event from Outlook for user ${userId}:`, error);
    throw error;
  }
}

// Sync induction category review date
export async function syncInductionReviewDate(
  userId: string,
  inductionItemId: number,
  reviewDate: string,
  categoryName: string
): Promise<void> {
  if (!reviewDate) return;

  const sourceId = `induction_${inductionItemId}`;
  await syncEventToOutlook({
    userId,
    sourceType: "induction_category",
    sourceId,
    eventTitle: `Induction Review: ${categoryName}`,
    eventDate: reviewDate,
    description: `Review scheduled for: ${categoryName}`,
  });
}

// Remove induction review from Outlook
export async function removeInductionReviewFromOutlook(
  userId: string,
  inductionItemId: number
): Promise<void> {
  const sourceId = `induction_${inductionItemId}`;
  await removeEventFromOutlook(userId, "induction_category", sourceId);
}

// Sync training matrix review date
export async function syncTrainingMatrixReviewDate(
  userId: string,
  submissionId: number,
  nextReviewDate: string
): Promise<void> {
  if (!nextReviewDate) return;

  const sourceId = `training_${submissionId}`;
  await syncEventToOutlook({
    userId,
    sourceType: "training_matrix",
    sourceId,
    eventTitle: "Training Matrix Review Due",
    eventDate: nextReviewDate,
    description: "Your next training matrix review is due",
  });
}

// Remove training matrix review from Outlook
export async function removeTrainingMatrixReviewFromOutlook(
  userId: string,
  submissionId: number
): Promise<void> {
  const sourceId = `training_${submissionId}`;
  await removeEventFromOutlook(userId, "training_matrix", sourceId);
}

// Sync all pending events for a user (useful for initial setup)
export async function syncAllUserEvents(userId: string): Promise<void> {
  try {
    // Sync all induction reviews with review dates
    const inductionReviews = await db
      .select()
      .from(inductionItemCompletions)
      .where(and(
        eq(inductionItemCompletions.reviewDate, reviewDate ?? null !== null) // Where reviewDate is not null
      ));

    for (const review of inductionReviews) {
      if (review.reviewDate) {
        // You'd need to join to get category name here
        await syncInductionReviewDate(
          userId,
          review.id,
          review.reviewDate,
          `Item ${review.templateItemId}`
        );
      }
    }

    // Sync all training matrix reviews
    const trainingReviews = await db
      .select()
      .from(trainingMatrixSubmissions)
      .where(eq(trainingMatrixSubmissions.userId, userId));

    for (const review of trainingReviews) {
      if (review.nextReviewDate) {
        await syncTrainingMatrixReviewDate(userId, review.id, review.nextReviewDate);
      }
    }
  } catch (error) {
    console.error(`Failed to sync all events for user ${userId}:`, error);
    throw error;
  }
}
