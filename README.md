# XLBot — Prometheus Product Vertical Submission

A chat-widget MVP that answers common XLRI academic/admin FAQs instantly, instead
of students digging through circulars or pinging batchmates on WhatsApp.

Built solo, same-day, ~1 hour of planning + the rest build time. This README
doubles as the planning writeup, in the order it was actually worked through.

## 1. Problem statement

XLRI students repeatedly ask the same handful of process/policy questions
(attendance cutoffs, course drop deadlines, certificate requests, fee
grievances, CGPA rules, grade re-evaluation) because the actual policy lives
scattered across the Academic Handbook, old circulars, and institutional
memory — not in one searchable place — which currently costs them a WhatsApp
message to seniors, a trip to the Academic Office, or minutes of digging
through PDFs for something that has one right answer. Today they solve it by
asking in batch WhatsApp groups, cornering a senior, or walking to the
Academic/Finance Office and waiting in line.

Supporting pain points:
- As a student, I struggle to know if I'm actually at risk of an attendance
  debarment because the cutoff and condonation process aren't stated anywhere
  I'd naturally look before it becomes urgent.
- As a student, I struggle to drop a course correctly because the add/drop
  window and its consequences (a "W" grade, needing Area Chair approval) are
  not obvious from the ERP UI itself.
- As a student, I struggle to know who to escalate a fee or grade discrepancy
  to because it depends on which office owns that particular problem, and
  that routing knowledge is undocumented tribal knowledge.

## 2. Pain point sourcing

No time for a real survey in the prep window, so this list was self-sourced
from (a) lived experience navigating a B-school ERP, and (b) the pattern of
questions that show up in every batch's WhatsApp groups around
add/drop-week, grade-release week, and fee-deadline week. Ranked by rough
(frequency x friction):

1. Attendance % calculation & shortage/debarment cutoff
2. Steps & deadline to drop/withdraw a course
3. How to request a bonafide certificate
4. Where to raise a fee-related grievance / refund query
5. CGPA / SGPA calculation formula
6. Grade query / re-evaluation process and window
7. Hostel/mess grievance routing *(cut — see scope)*
8. Transcript / migration certificate request *(cut — see scope)*

## 3. Scope cut

**IN SCOPE (MVP):**
1. Attendance policy & shortage cutoff
2. Course drop / withdrawal process
3. Bonafide certificate request
4. Fee-related grievances
5. CGPA / SGPA calculation
6. Grade query / re-evaluation process

**OUT OF SCOPE (v2):**
- Live ERP data integration (a student's actual attendance %, actual CGPA)
- Authentication / login
- Multi-turn memory beyond the current browser session
- Admin dashboard for editing the FAQ set or viewing analytics
- Hostel/mess and transcript/migration-certificate intents
- LLM-based free-text matching (Option B, see Tech Decisions)

**Why the cut:** the MVP answers policy/process questions instantly; it does
not pull personalized live data, because that needs ERP API access this
project doesn't have and isn't the point being tested today — see [Section 9](#9-why-this-pain-point-and-not-live-erp-data).

## 4. User flow

**Core flow:** student lands on the bot -> types free text or taps a
quick-reply chip (one of the 6 MVP intents) -> bot matches intent -> bot
returns a concise answer plus a source note and the real office/contact to
follow up with -> bot asks "did this help?" (yes/no).

**Failure-mode flow:** query doesn't match confidently -> bot says so
explicitly instead of guessing -> if it has a plausible near-match, it offers
1-3 suggestion chips for the closest intents -> either way it gives a
fallback contact (Academic Office) so the student is never stuck with a dead
end.

Quick-reply chips stay visible at all times (not just on first load) so a
demo — or a real user with an oddly-phrased question — always has a
guaranteed-good path to an answer, even if free-text matching misses.

## 5. Information architecture

The knowledge base is `src/data/faq.json` — one object per intent:

```json
{
  "id": "attendance_policy",
  "intent_name": "Attendance % & Shortage Cutoff",
  "chip_label": "Attendance rules",
  "sample_user_phrasings": ["how is attendance calculated", "..."],
  "answer_text": "...",
  "source": "Academic Handbook, Attendance Norms section (approximated...)",
  "fallback_contact": "Academic Office — academic.office@xlri.ac.in"
}
```

**Important caveat:** the `answer_text` and `source` fields are policy
content approximated from typical B-school norms for demo purposes — they
have not been cross-checked against XLRI's actual current Academic Handbook.
Every entry says so explicitly in its `source` field. This is a placeholder
content layer proving the product shape works; it is not a substitute for
verified institutional policy and shouldn't be treated as authoritative
without that verification pass.

Bot copy (welcome message, fallback strings, match threshold) lives
separately in `src/data/botConfig.json` so content edits never touch code.

## 6. Matching logic

**Option A (implemented):** client-side keyword/fuzzy matching in
`src/lib/matcher.js` — zero dependencies, zero API key, zero latency, zero
cost. For each canned phrasing in an intent, it scores what fraction of that
phrasing's keywords appear in the user's free-text query (tolerant of typos
via edit-distance, and of substrings for longer words), then returns the
best-scoring intent above a threshold, or the closest near-misses if nothing
clears it. Deliberately precision-oriented (score = matched / phrasing
length, not a symmetric overlap) so a long, rambling query with filler words
isn't penalized for not resembling a short canned phrase.

**Option B (not built):** call an LLM with the FAQ JSON as context
(RAG-lite) for more natural free-text handling. Explicitly deferred — Option
A was shipped and demo-tested end-to-end first, per the plan of never
building the fallback-quality option first and risking shipping nothing. An
OpenCode API key is available for this upgrade path if time allows post-MVP;
it is not wired in.

## 7. Interface

Single-page chat widget: message list + text input + a permanent row of 6
quick-reply chips for the MVP intents. No auth. Plain CSS, no UI framework.

Visual design deliberately carries both sponsoring identities rather than a
generic look: the navy (`#11336f`) header and lime-olive (`#bccf17`) accent
stripe are sampled from xlri.ac.in's own header; the teal-to-indigo gradient
on the send button and user bubbles, plus the cyan focus ring, are sampled
from prometheus.xlri.ac.in. Both official logos (XLRI crest, Prometheus
mark) sit in the header. Light/dark mode both follow the OS setting.

## 8. Success metrics (would track in production)

- **Deflection rate** — % of queries resolved without falling through to the
  human/office fallback contact.
- **Top unmatched queries** — signals which intent to add next; the single
  highest-leverage feedback loop for this product.
- **Time-to-answer vs. the current workaround** — bot response is instant;
  a WhatsApp-group answer or office visit is minutes to hours.
- **Repeat-query rate per intent** — validates that Section 2's ranking
  actually picked genuinely high-frequency pain points, not just guessed
  ones.

## 9. Why this pain point, and not live ERP data

The highest-frequency friction isn't "I don't know my own attendance
number" — that number is already sitting in the ERP. It's "I don't know the
*rule* behind the number, or the *process* to act on it once I see it." That
is a knowledge/discovery gap, not a data-access gap — and a policy-FAQ bot
solves exactly that without needing ERP integration, which is the honest
reason this MVP is scoped the way it is.

## 10. What's built vs. explicitly not built

**Built:**
- 6-intent FAQ knowledge base with source notes and fallback contacts
- Dependency-free keyword/fuzzy matcher with typo tolerance
- Full chat UI: message history, quick-reply chips, free-text input,
  unmatched-query fallback with suggestions, helpful-feedback loop
- Light/dark theming, mobile-responsive layout
- Production build verified (`vite build`); dev flow manually tested in
  browser including the unmatched-query and negative-feedback paths

**Explicitly not built (v2), so these don't read as oversights:**
- Live ERP data integration (real attendance %, real CGPA, real fee status)
- Authentication / login
- Cross-session memory (a new tab starts a fresh conversation)
- Admin dashboard for non-technical FAQ editing or analytics
- LLM-based matching (Option B) — the OpenCode key is available for this,
  intentionally left for after the keyword-match MVP proved out
- Verification of `faq.json` content against the actual current Academic
  Handbook (see the caveat in Section 5)

## 11. Beyond XLRI academics: an ExLink onboarding extension

Nothing about this architecture is specific to *enrolled-student* academic
FAQs — `faq.json` is the only content-coupled piece, and `matcher.js` /
the chat UI don't know or care what the intents are about. ExLink already
owns the incoming-student onboarding funnel (admissions guidance, GDPI
coordination, joining formalities), which is the same shape of problem:
a fixed set of high-frequency process questions from people who don't yet
know who to ask. Swap in an onboarding-flavored `faq.json` — required
documents, hostel allotment process, fee payment deadlines pre-joining,
orientation schedule — and the same bot, matcher, and UI serve ExLink's
incoming batch with no code changes. Flagged here as a scoped extension
idea, not built in this MVP.

## Running locally

```bash
npm install
npm run dev
```

## Building for production

```bash
npm run build
npm run preview   # sanity-check the production build locally
```

Deploys as a static site — no backend, no environment variables, no API
keys required for the shipped MVP. Any static host (Vercel, Netlify, GitHub
Pages) works with zero config beyond pointing it at this repo.

## Project structure

```
src/
  data/
    faq.json         # the knowledge base (Section 5)
    botConfig.json   # bot copy strings, match threshold
  lib/
    matcher.js       # Option A keyword/fuzzy matching
  hooks/
    useChatBot.js    # chat state + intent-matching flow
  components/
    ChatWindow.jsx
    MessageBubble.jsx
    QuickReplyChips.jsx
    ChatInput.jsx
  assets/
    xlri-logo.png        # official XLRI crest, from xlri.ac.in
    prometheus-logo.png  # official Prometheus mark (with wordmark)
    prometheus-icon.png  # official Prometheus mark (icon only, used in header)
  App.jsx
```
