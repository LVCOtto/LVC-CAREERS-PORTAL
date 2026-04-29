import { Client } from "@microsoft/microsoft-graph-client";

const MICROSOFT_GRAPH_ENDPOINT = "https://graph.microsoft.com/v1.0";
const MICROSOFT_OAUTH_ENDPOINT = "https://login.microsoftonline.com/common/oauth2/v2.0";

export interface OutlookAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

let authConfig: OutlookAuthConfig | null = null;

export function initializeOutlookAuth(config: OutlookAuthConfig) {
  authConfig = config;
}

export function getAuthConfig(): OutlookAuthConfig {
  if (!authConfig) {
    throw new Error("Outlook auth not configured. Call initializeOutlookAuth() first");
  }
  return authConfig;
}

export function getAuthorizationUrl(state: string): string {
  if (!authConfig) throw new Error("Outlook auth not configured");

  const params = new URLSearchParams({
    client_id: authConfig.clientId,
    redirect_uri: authConfig.redirectUri,
    response_type: "code",
    scope: "Calendars.ReadWrite offline_access",
    state,
  });

  return `${MICROSOFT_OAUTH_ENDPOINT}/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<TokenResponse> {
  if (!authConfig) throw new Error("Outlook auth not configured");

  try {
    const response = await fetch(`${MICROSOFT_OAUTH_ENDPOINT}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: authConfig.clientId,
        client_secret: authConfig.clientSecret,
        code,
        redirect_uri: authConfig.redirectUri,
        grant_type: "authorization_code",
        scope: "Calendars.ReadWrite offline_access",
      }).toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    const data = await response.json();
    const expiresInSeconds = data.expires_in || 3600;
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt,
    };
  } catch (error: any) {
    console.error("Token exchange error:", error.message);
    throw new Error(`Failed to exchange code for token: ${error.message}`);
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  if (!authConfig) throw new Error("Outlook auth not configured");

  try {
    const response = await fetch(`${MICROSOFT_OAUTH_ENDPOINT}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: authConfig.clientId,
        client_secret: authConfig.clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
        scope: "Calendars.ReadWrite offline_access",
      }).toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token refresh failed: ${error}`);
    }

    const data = await response.json();
    const expiresInSeconds = data.expires_in || 3600;
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresAt,
    };
  } catch (error: any) {
    console.error("Token refresh error:", error.message);
    throw new Error(`Failed to refresh access token: ${error.message}`);
  }
}

export function createGraphClient(accessToken: string): Client {
  const client = Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });
  return client;
}

export interface CalendarEvent {
  subject: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  categories?: string[];
  description?: string;
  isReminderOn?: boolean;
  reminderMinutesBeforeStart?: number;
}

export async function createCalendarEvent(
  accessToken: string,
  event: CalendarEvent
): Promise<string> {
  try {
    const client = createGraphClient(accessToken);
    const createdEvent = await client.api("/me/events").post(event);
    return createdEvent.id;
  } catch (error: any) {
    console.error("Calendar event creation error:", error);
    throw new Error(`Failed to create calendar event: ${error.message}`);
  }
}

export async function updateCalendarEvent(
  accessToken: string,
  eventId: string,
  event: Partial<CalendarEvent>
): Promise<void> {
  try {
    const client = createGraphClient(accessToken);
    await client.api(`/me/events/${eventId}`).patch(event);
  } catch (error: any) {
    console.error("Calendar event update error:", error);
    throw new Error(`Failed to update calendar event: ${error.message}`);
  }
}

export async function deleteCalendarEvent(accessToken: string, eventId: string): Promise<void> {
  try {
    const client = createGraphClient(accessToken);
    await client.api(`/me/events/${eventId}`).delete();
  } catch (error: any) {
    console.error("Calendar event deletion error:", error);
    throw new Error(`Failed to delete calendar event: ${error.message}`);
  }
}
