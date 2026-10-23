export interface PostSeed { slug: string; title: string; category: string; excerpt: string; tags: string[]; body: string }

export const POSTS: PostSeed[] = [
  {
    slug: "wordpress-vs-shopify-vs-nextjs", title: "WordPress, Shopify or Next.js: how to choose the right platform", category: "web-development",
    excerpt: "The platform decides who can edit the site, how fast it loads and what it costs to change. Here is how to choose without regret.", tags: ["platforms", "wordpress", "shopify", "nextjs"],
    body: `Choosing a platform is the first big decision in any website project, and it is often made for the wrong reasons. Here is a simple way to think about it.

## Start with who edits the site

If your team will update pages every week, pick a platform with an editor they are comfortable with. **WordPress**, **Squarespace** and **Wix** are strong here. If only a developer will touch the code, **Next.js** or **Laravel** become realistic options.

## Match the platform to the job

- **Content-heavy sites and blogs:** WordPress gives the most flexibility and plugins.
- **Online stores:** Shopify handles checkout, payments, tax and inventory so you do not have to.
- **Simple brochure sites you manage yourself:** Squarespace or Wix launch quickly and look clean.
- **Custom features, web apps and top performance:** Next.js or Laravel give you full control.

## Think about cost over three years

A cheap build that needs a developer for every change gets expensive. A custom build that never needs plugins can be cheaper to run. Count hosting, plugins, themes, apps and the time it takes to make changes.

## Do not ignore SEO

Any of these platforms can rank well when built properly. Problems come from slow themes, heavy plugins, messy URLs and missing structure, not from the platform itself.

## A quick rule

If you sell products, start with Shopify. If you publish content, start with WordPress. If you need something unusual or very fast, start with Next.js or Laravel. If you want the simplest possible site, start with Squarespace or Wix.

Still unsure? [Book a free consultation](/contact) and we will recommend one in plain English.`,
  },
  {
    slug: "local-seo-checklist-service-businesses", title: "A local SEO checklist for service businesses", category: "seo",
    excerpt: "Plumbers, clinics, electricians and other local businesses win work from Google Maps and local search. Start with this checklist.", tags: ["local seo", "google business profile"],
    body: `Local customers search with intent: "plumber near me", "dentist in Houston". If you appear, you get the call. This checklist covers the essentials.

## 1. Claim and complete your Google Business Profile

Choose the right primary category, add every service you offer, write a clear description, add real photos and keep your hours accurate. This profile is often the first thing a customer sees.

## 2. Keep your name, address and phone consistent

Use the exact same business name, address and phone number everywhere: your website, directories, social profiles and the Business Profile.

## 3. Build a page for each service and each area

A single "Services" page rarely ranks well. Create a separate page for each core service, and for each area you serve, with real details about that service and that place. Avoid copying the same text and swapping the city name.

## 4. Earn reviews and reply to them

Ask happy customers for a review right after the job. Reply politely to every review, good or bad.

## 5. Make the site fast and easy on a phone

Most local searches happen on mobile. Put a tap-to-call button and a short form near the top of every page.

## 6. Add local schema markup

Structured data helps search engines understand your business type, location and services.

## 7. Track the right numbers

Watch calls, direction requests, form submissions and booked jobs. Rankings matter, but enquiries pay the bills.

If you want help with any of this, our [SEO service](/services/seo) includes local SEO, and we can build [location pages](/contact) for the areas you serve.`,
  },
  {
    slug: "what-to-automate-first", title: "What to automate first: seven AI workflows for small businesses", category: "ai-automation",
    excerpt: "Do not automate everything. Start with the repetitive tasks that cost you leads and hours, and prove the value before expanding.", tags: ["automation", "n8n", "ai", "crm"],
    body: `The best automation is boring: it removes a repetitive task so nobody has to remember to do it. Here are seven good places to start.

## 1. New lead to CRM

When someone fills in a form, add them to your CRM, tag the source and notify the right person. No copy and paste.

## 2. Instant follow-up

Send a friendly confirmation within a minute of an enquiry, with the next step. Fast replies win work.

## 3. Appointment booking and reminders

Let customers book online, then send reminders by email or WhatsApp to reduce no-shows.

## 4. Enquiry sorting with AI

Use an AI step to read incoming messages, tag them (sales, support, spam) and draft a reply for you to approve.

## 5. Invoice and payment reminders

Send polite reminders on a schedule and update your records when a payment arrives.

## 6. Document and data extraction

Pull details from PDFs, receipts or emails into a spreadsheet or accounting tool.

## 7. Weekly reporting

Collect numbers from your ads, website and CRM and send one clear summary every Monday.

## How to choose

Pick the task you repeat most, that follows clear rules, and where a mistake is easy to catch. Keep a human approval step for anything that speaks to customers or moves money.

Tools like n8n, Make and Zapier can connect most of what you already use. [See how our AI automation service works](/services/ai-automation).`,
  },
  {
    slug: "how-to-brief-a-video-editor", title: "How to brief a video editor so you get the right cut the first time", category: "video",
    excerpt: "A good brief saves days of revisions. Use this simple structure when you send footage to an editor.", tags: ["video editing", "briefing"],
    body: `Most video revisions come from unclear briefs, not from poor editing. Give your editor these six things and the first cut will be much closer to what you want.

## 1. The goal of the video

Is it to get views, sell a product, explain something or recruit? One video, one goal.

## 2. The audience and platform

A Reel for Instagram, a YouTube tutorial and a website promo all need different pacing, framing and length. Tell the editor where it will be posted.

## 3. References

Send two or three videos you like and say what you like about each: the pace, the captions, the music, the transitions.

## 4. The structure you want

For short-form, the first three seconds matter most. Tell the editor the hook, the main points and the call to action.

## 5. Brand details

Share fonts, colours, a logo and any phrases that must appear. Mention words that must never be used.

## 6. Delivery details

List the formats, the deadline and the number of revision rounds you expect.

## Make feedback easy

Give notes with timestamps, for example "00:12, cut the pause". Group all notes into one round instead of sending them one by one.

Need an editing partner? [See our video editing service](/services/video-editing).`,
  },
  {
    slug: "website-redesign-seo-checklist", title: "Website redesign checklist: keep your rankings while you rebuild", category: "web-development",
    excerpt: "A redesign can lift performance or wipe out years of SEO. These steps protect what already works.", tags: ["redesign", "migration", "seo"],
    body: `A new design is exciting, but a careless rebuild can cost you rankings and leads. Use this checklist to protect your search performance.

## Before you start

- **Record your current performance:** organic traffic, top pages, top queries and conversions.
- **Crawl the old site** and export every URL, title, description and heading.
- **Identify the pages that earn traffic and links.** Those pages need extra care.

## During the redesign

- **Keep strong content.** Improve it instead of deleting it.
- **Keep URLs the same where possible.** When a URL must change, plan a redirect.
- **Carry over titles, descriptions, headings and structured data.**
- **Check mobile layout, speed and accessibility** on a staging site before launch.

## At launch

- **Add 301 redirects** from every old URL to its best new match.
- **Submit the new sitemap** to Google Search Console.
- **Make sure the site is not blocked** by a leftover noindex tag or robots rule.
- **Test forms, tracking and checkout.**

## After launch

- **Watch Search Console daily for the first weeks.** Look for crawl errors and drops.
- **Fix broken links and missing redirects quickly.**
- **Compare traffic and conversions** with the numbers you recorded.

Planning a redesign? [Talk to us first](/contact), and we will map the migration before any design starts.`,
  },
  {
    slug: "what-drives-website-cost", title: "How much does a website cost? What actually drives the price", category: "web-development",
    excerpt: "Prices vary wildly because the work varies wildly. Here is what moves the number, so you can compare quotes fairly.", tags: ["pricing", "planning"],
    body: `Two quotes for "a website" can differ by ten times, and both can be honest. The difference is in what is included. These are the things that move the price.

## 1. The platform

A template on Wix or Squarespace costs less than a custom Next.js build, but offers less flexibility. A Shopify store sits in between.

## 2. The number and type of pages

A five-page brochure site is a very different job from a fifty-page site with a blog, service pages and location pages.

## 3. Design

A template with your branding is faster than a fully custom design with new layouts, illustrations and animations.

## 4. Content

Who writes the copy and prepares the photos? Writing, editing and photography take real time, and they are often the slowest part.

## 5. Features and integrations

Booking systems, payments, memberships, CRMs, multiple languages and custom dashboards all add work.

## 6. SEO and performance

Technical SEO, speed work, structured data and migrations from an old site are time well spent, but they cost time.

## 7. Ongoing needs

Hosting, updates, backups and support are separate from the build. Ask what happens after launch.

## How to compare quotes

Ask each agency to list pages, platform, number of design rounds, who writes the content, what SEO is included and what support follows launch. Then compare like with like.

See our current [packages and pricing](/pricing), or [ask for a quote](/contact).`,
  },
];
