# Forma One Email Studio

Magazine-style, on-brand emails for Forma One investors, built from reusable blocks and sent through **SendFox**.

Each email is a small JSON file listing its blocks in order. The studio turns it into responsive, email-safe HTML (via [MJML](https://mjml.io)) that renders properly in Gmail, Outlook, Apple Mail and on phones, then pushes it to SendFox as a draft for review.

## Quick start

```bash
npm install
npm run preview        # http://localhost:4600 — rebuilds every time you save
```

Edit any file in `emails/`, save, and refresh the preview.

## Make a new email

1. Copy a starter in `emails/` (for example `quarterly-update.json`) and rename it.
2. Change the `subject`, `preheader` (the grey preview line in the inbox) and the blocks.
3. Check it in the preview, on desktop and phone width.

### Blocks

| type | What it is | Main fields |
|---|---|---|
| `topbar` | Navy strip with the logo | `label` |
| `hero` | Full-width photo with a big headline | `image`, `eyebrow`, `title`, `subtitle`, `button{text,url}`, `height` |
| `intro` | Greeting and paragraphs | `heading`, `paragraphs[]`, `signoff` |
| `stats` | Big-number band | `title`, `items[{value,label,note,down}]` (3 or 4 items) |
| `spotlight` | Photo beside text | `image`, `eyebrow`, `title`, `text`, `link`, `imageRight`, `background` |
| `gallery` | Two-up photo grid | `title`, `caption`, `images[{url,alt,label}]` |
| `quote` | Pull quote | `text`, `author` |
| `progress` | Progress bar and milestone list | `eyebrow`, `title`, `percent`, `percentLabel`, `steps[{name,date,done}]` |
| `cta` | Navy call-to-action band | `title`, `text`, `button`, `secondary` |
| `divider` | Thin line | — |
| `footer` | Logo, links and disclaimer | `disclaimer` (optional override) |

Brand colours, fonts, logo and links live in `brand.json` (logo colours: navy `#0A2D6E`, red `#DA1F26`, sky `#7DB8E3`).

### Images

Email images must be on a public web address and should be **under ~150 KB** (1200 px wide JPEGs at ~70% quality). Forma One's are hosted at `https://invest.forma1.agency/email-assets/`. Hero images use a `-hero.jpg` version with a dark fade at the bottom so white headlines stay readable in every email client.

## Send with SendFox

1. In SendFox: **Settings → API → Personal Access Tokens → Create**.
2. Copy `.env.example` to `.env` and paste the token as `SENDFOX_TOKEN=`. `.env` is never committed.
3. Find your list ID, then create a draft:

```bash
npm run sendfox -- lists
npm run sendfox -- draft quarterly-update --list 12345
```

4. Open SendFox → **Emails**, review the draft, **send yourself a test**, then send or schedule it there.
   (`npm run sendfox -- send <campaignId>` also works and asks you to type SEND to confirm.)

SendFox adds its own unsubscribe footer and physical address to every campaign, as required by anti-spam law.

## Build only

```bash
npm run build          # writes dist/<name>.html and dist/index.html
```

`dist/` is not committed; anyone can rebuild it.

## Notes

- Everything investor-facing should be reviewed by the team before sending. Performance numbers are targets and estimates unless stated otherwise; the default footer disclaimer says so.
- Never put wire instructions in an email.
