# Outlook Calendar Integration Setup Guide

## Overview

This implementation allows users to sync:
- **Induction category review dates** → Outlook calendar events
- **Training matrix next review dates** → Outlook calendar events

Events are created as all-day events with 24-hour advance reminders.

## Setup Steps

### 1. Azure App Registration

You need to create a Microsoft Azure app to get OAuth credentials.

**Steps:**
1. Go to [Azure Portal](https://portal.azure.com)
2. Search for "App registrations" and click it
3. Click "+ New registration"
4. Fill in:
   - **Name**: "LVC Careers Portal" (or your app name)
   - **Supported account types**: Select "Accounts in any organizational directory and personal Microsoft accounts"
   - **Redirect URI**: Add `http://localhost:5000/api/outlook/callback` for development
5. Click "Register"

**Get your credentials:**
1. After registration, copy the **Application (client) ID** - this is your `MICROSOFT_CLIENT_ID`
2. Go to "Certificates & secrets" → "+ New client secret"
3. Copy the secret value - this is your `MICROSOFT_CLIENT_SECRET` (keep this private!)

**Set API permissions:**
1. Go to "API permissions" → "+ Add a permission"
2. Click "Microsoft Graph"
3. Select "Delegated permissions"
4. Search for "Calendars" and check:
   - `Calendars.ReadWrite`
5. Click "Add permissions"

### 2. Environment Variables

Add these to your `.env` file:

```
MICROSOFT_CLIENT_ID=your_client_id_here
MICROSOFT_CLIENT_SECRET=your_client_secret_here
MICROSOFT_REDIRECT_URI=http://localhost:5000/api/outlook/callback
APP_URL=http://localhost:5000
```

For production, update `MICROSOFT_REDIRECT_URI` and `APP_URL` to your production domain.

### 3. Database Migration

Run the database migration to add the new tables:

```bash
npm run db:push
```

This will create:
- `outlook_integrations` - Stores OAuth tokens per user
- `calendar_sync_log` - Tracks synced events

### 4. Update Induction UI

To allow users to set review dates on induction items, update your Induction page to include a review date picker:

```tsx
// In your induction item form component
import { Input } from '@/components/ui/input';

// Add this field to your form:
<label>Review Date (optional)</label>
<Input
  type="date"
  value={reviewDate || ''}
  onChange={(e) => setReviewDate(e.target.value)}
/>

// When saving, include it in the API call:
await fetch(`/api/induction/${userId}/complete-item`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    templateItemId,
    completed,
    reviewDate, // Add this
    // ... other fields
  })
});
```

### 5. Add Outlook Settings Component to UI

Add the `OutlookSettings` component to your settings/profile page:

```tsx
import { OutlookSettings } from '@/components/OutlookSettings';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Other settings... */}
      <OutlookSettings />
    </div>
  );
}
```

### 6. Install Dependencies

Run:
```bash
npm install
```

This installs:
- `@microsoft/microsoft-graph-client` - Microsoft Graph API client
- `@azure/identity` - Azure authentication (already listed in dependencies)

### 7. Test the Integration

1. **Start your app:**
   ```bash
   npm run dev
   ```

2. **Test connection:**
   - Navigate to your settings page
   - Click "Connect to Outlook"
   - You'll be redirected to Microsoft login
   - Grant calendar permissions
   - You should be redirected back to your app

3. **Test sync:**
   - Create/update an induction item with a review date
   - Or update a training matrix with a next review date
   - Check your Outlook calendar - the event should appear

## Features

### Automatic Sync
- ✅ Creating/updating review dates automatically syncs to Outlook
- ✅ Events are created as all-day events with 24-hour reminders
- ✅ Events are categorized as "LVC Portal"
- ✅ Events include descriptions with details

### Manual Sync
- Users can click "Sync All Events Now" to manually sync any unsynced events
- Useful if events were created before Outlook connection

### Token Management
- Access tokens are automatically refreshed when expired
- If refresh fails, integration is disabled to prevent errors
- Users can reconnect at any time

### Data Privacy
- Only the current user's events are synced
- Tokens are stored securely in your database
- Users can disconnect at any time

## Troubleshooting

### "Outlook integration not configured" error
- Check your `.env` file has `MICROSOFT_CLIENT_ID` and `MICROSOFT_CLIENT_SECRET`
- Make sure you've created an Azure app registration

### Events not appearing in calendar
1. Check browser console for errors
2. Verify the review date was sent in the request
3. Try clicking "Sync All Events Now"
4. Check Outlook settings - ensure calendar sync is enabled

### Redirect URI mismatch error
- Make sure `MICROSOFT_REDIRECT_URI` in `.env` exactly matches the redirect URI in Azure app registration
- For local development: `http://localhost:5000/api/outlook/callback`
- For production: Use your production domain

### Permission denied errors
- Make sure the Azure app has "Calendars.ReadWrite" permission
- Some enterprise/school accounts may have restricted OAuth permissions

## File Changes Summary

**New files created:**
- `server/outlookAuth.ts` - OAuth and Microsoft Graph integration
- `server/calendarSync.ts` - Calendar event sync logic
- `client/src/components/OutlookSettings.tsx` - Settings UI component

**Modified files:**
- `shared/schema.ts` - Added 3 new tables
- `server/routes.ts` - Added 5 new API endpoints
- `package.json` - Added Microsoft Graph packages

**Database changes:**
- `induction_item_completions` table: Added `review_date` column
- `outlook_integrations` table: Created new
- `calendar_sync_log` table: Created new

## Future Enhancements

Potential improvements:
- ✅ Two-way sync (detect Outlook calendar changes)
- ✅ Event templates/customization
- ✅ Bulk sync for managers
- ✅ Email reminders before dates
- ✅ Support for other calendar providers (Google Calendar, iCal)

## Support

For issues with:
- **Microsoft Graph API**: See [Microsoft Graph documentation](https://docs.microsoft.com/en-us/graph/)
- **Azure App Registration**: See [Azure identity documentation](https://learn.microsoft.com/en-us/azure/active-directory/)
- **This integration**: Check the error logs in browser console and server logs
