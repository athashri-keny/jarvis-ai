# Jarvis: A Personal AI Assistant

Jarvis is a personal AI assistant that manages my email, calendar, and daily routine, and reaches out to me **on its own** instead of waiting for me to open an app.

> Example: every morning at 8:00 AM, my phone buzzes with: *"Good morning. You have 3 meetings today, 2 emails need replies, and it's Rahul's birthday. I've drafted a wish. Tap to send."* I never opened anything.

## Features

### 1. Email
Jarvis can fetch my recent emails and write reply drafts.

> Example: I type *"Summarise my unread emails and draft a reply to the one from the recruiter."* Jarvis reads the inbox, summarises it, and leaves a draft ready for me to review.

### 2. Google Calendar
Jarvis can read upcoming events and create new ones.

> Example: *"Schedule a call with Priya on Friday at 4 PM."* Jarvis creates the event on my calendar.

### 3. Proactive morning briefing (cron job)
A scheduled job runs at **8:00 AM** every day. It summarises upcoming events and emails, flags friends' birthdays, and sends everything as a push notification.

> Example: the notification lists today's events, highlights important emails, and says *"It's Aman's birthday today."*

### 4. Birthday reminders
Jarvis finds friends' birthdays, fetches their phone number via the Google People API, drafts a wish, and attaches a `wa.me` link. One tap opens WhatsApp with the message ready, and I press send myself.

> Example: the notification says *"Aman's birthday today."* I tap the link and WhatsApp opens with *"Happy birthday Aman! Wishing you a great year ahead."* pre-filled.

### 5. Long-term memory
Jarvis has a memory tool with three actions: **add**, **remove**, and **recall**. It saves my preferences so I don't repeat myself.

> Example: I say *"Remember that I prefer short email replies."* Next week, Jarvis writes short drafts without being told.

### 6. Phone notifications
Notifications are delivered through a self-hosted [ntfy](https://ntfy.sh) server. All scheduled jobs share one notify tool, and each job supplies its own prompt.

> Example: the morning briefing and the birthday reminder use the same notification tool but different prompts.

### 7. Habit tracker *(in progress)*
Log daily habits with a duration and a note. Streaks and stats come next.

> Example: *"Log 45 minutes of DSA practice, solved 3 array problems."* Stored as one record per habit per day, so a streak is simply consecutive days with a record.

## Tech Stack

| Layer | Tools |
|---|---|
| Frontend / Dashboard | Next.js, TypeScript |
| Agent framework | LangGraph |
| Database | MongoDB |
| Integrations | Gmail API, Google Calendar API, Google People API |
| Notifications | ntfy (self-hosted on Render) |
| Messaging | WhatsApp via `wa.me` links |

## How It Works

```
        8:00 AM cron
             |
             v
   LangGraph agent  <--->  Memory tool (MongoDB)
     |      |      |
     v      v      v
  Gmail  Calendar  People API
             |
             v
     ntfy notification  -->  my phone  -->  wa.me link  -->  WhatsApp
```

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB database
- A Google Cloud project with the Gmail, Calendar, and People APIs enabled
- An ntfy server (self-hosted or ntfy.sh)
- An LLM API key

### Installation

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
npm install
```

### Environment variables

Create a `.env.local` file:

```env
MONGODB_URI=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NTFY_URL=
NTFY_TOPIC=
LLM_API_KEY=
```

> Never commit `.env.local`. Add it to `.gitignore`.

### Run

```bash
npm run dev
```

Open `http://localhost:3000/dashboard`.

## Roadmap

- [x] Gmail: fetch emails and write drafts
- [x] Google Calendar: create and fetch events
- [x] 8:00 AM cron briefing with push notifications
- [x] Birthday reminders with WhatsApp links
- [x] Memory tool (add, remove, recall)
- [ ] Habit tracker: logging, streaks, stats
- [ ] Morning plan
- [ ] WhatsApp API integration for drafting messages and replies
- [ ] Voice agent (OpenAI Realtime API)

## Author

**Athashri** · [@Athashri_k](https://x.com/Athashri_k)
