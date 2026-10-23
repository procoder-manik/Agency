# Agency Website Platform

Next.js 14 (App Router) + PostgreSQL (Drizzle ORM) + Tailwind CSS. A themeable, animated agency website with a full admin panel, SEO system and AI writing tools.

## দ্রুত শুরু (Quick start)

```bash
npm install
cp .env.example .env        # তারপর DATABASE_URL আর JWT_SECRET বসান
npm run setup               # টেবিল তৈরি + অ্যাডমিন + থিম + বিল্ট-ইন পেজ + স্যাম্পল কনটেন্ট
npm run dev                 # http://localhost:3000  |  অ্যাডমিন: /admin
```

`npm run setup` বারবার চালানো নিরাপদ: যা আগে থেকে আছে সেটা আবার তৈরি করে না।

## PostgreSQL কোথায় পাবেন

যেকোনো একটা বেছে নিন, তারপর connection string কপি করে `.env`-এর `DATABASE_URL`-এ বসান:

- **Neon** (neon.tech): ফ্রি প্ল্যান, IP whitelist লাগে না। Dashboard > Connection string.
- **Supabase** (supabase.com): Project Settings > Database > Connection string (URI)। Vercel-এ চালালে "Transaction pooler" (পোর্ট 6543) স্ট্রিংটা নিন।
- লোকাল: `postgresql://user:pass@localhost:5432/agency`

## Vercel-এ ডিপ্লয়

1. কোড GitHub-এ পুশ করে Vercel-এ ইমপোর্ট করুন।
2. Environment Variables-এ `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `NEXT_PUBLIC_SITE_URL` দিন।
3. Build command হিসেবে Vercel নিজে থেকেই `vercel-build` চালায় (migration + build)।
4. প্রথমবার শুধু একবার নিজের কম্পিউটার থেকে প্রোডাকশন `DATABASE_URL` দিয়ে `npm run setup` চালান (অ্যাডমিন ও ডিফল্ট ডেটা বসাতে)।

অন্য Node হোস্টে (Railway, Render, VPS): `npm run setup && npm run build && npm start`.

## ডেটাবেস মেইনটেন্যান্স

- কনটেন্টের সব ফিল্ড `entries.data` (JSONB) কলামে থাকে, তাই অ্যাডমিনে নতুন ফিল্ড যোগ করতে migration লাগে না। ফিল্ডের তালিকা: `lib/collections.ts` আর `lib/blocks.ts`।
- টেবিলের কাঠামো বদলাতে চাইলে `migrations/` ফোল্ডারে নতুন `002_xxx.sql` ফাইল দিয়ে `npm run db:migrate` চালান। প্রতিটা ফাইল একবারই চলে।
- মিডিয়া ফাইল ডেটাবেসেই রাখা হয় (প্রতিটা সর্বোচ্চ 10 MB; JPG/PNG অটো WebP হয়), তাই আলাদা স্টোরেজ সেটআপ লাগে না এবং Vercel-এও কাজ করে।
- ব্যাকআপ: Neon/Supabase নিজেই ব্যাকআপ রাখে। ম্যানুয়ালি: `pg_dump "$DATABASE_URL" > backup.sql`।

## AI (ঐচ্ছিক)

কোনো key ছাড়াই সাইট চলে; AI বাটনগুলো তখন বন্ধ থাকে। Admin > AI tools-এ ফ্রি key দিন (Gemini, Groq বা OpenRouter)। একটা প্রোভাইডার rate limit দিলে পরেরটা নিজে থেকে চেষ্টা হয়। AI শুধু সাইটের আসল তথ্য আর আপনার লেখা তথ্য ব্যবহার করে; মানুষের না দেওয়া সংখ্যা অটোমেটিক মুছে যায়।

## ইমেইল নোটিফিকেশন (ঐচ্ছিক)

`.env`-এ `SMTP_*` দিন। না দিলেও ফর্ম সাবমিশন ও লিড সেভ হয়, শুধু ইমেইল যায় না।

## কোথায় কী

| Path | কাজ |
| --- | --- |
| `app/(site)` | পাবলিক সাইট (সব পেজ ডেটাবেসের সেকশন থেকে তৈরি) |
| `app/admin` | অ্যাডমিন প্যানেল |
| `app/api/admin` | অ্যাডমিন API (JWT কুকি দিয়ে সুরক্ষিত) |
| `lib/themes.ts` | ডিজাইন টোকেন ও থিম প্রিসেট |
| `lib/seo.ts` | মেটাডেটা ও সম্মিলিত JSON-LD |
| `lib/ai/` | প্রোভাইডার লেয়ার, সাইট কনটেক্সট, AI টাস্ক |
| `lib/settings-defaults.ts` | ডিফল্ট সেটিংস (প্লেসহোল্ডার এজেন্সি তথ্য) |

## প্রথম লগইনের পর

1. Settings > Site identity: এজেন্সির নাম, ডোমেইন, লোগো, যোগাযোগ।
2. Users: পাসওয়ার্ড বদলান।
3. Themes: থিম বেছে নিন বা নিজের থিম বানান।
4. স্যাম্পল কনটেন্ট (Services, Work, Team, Testimonials, Blog) নিজের আসল তথ্য দিয়ে বদলান বা মুছে দিন।
5. Settings > Features: শুধু কোট নিতে চাইলে "Public pricing" বন্ধ করুন।

## ডিজাইন ও অ্যানিমেশন

- **Dark ও Light mode দুটোই আছে।** প্রতিটা থিমের নিজস্ব dark ও light palette আছে। হেডারের টগল দিয়ে ভিজিটর বদলাতে পারে, পছন্দ মনে থাকে, আর প্রথমবার ডিভাইসের সেটিং অনুসরণ করে। Admin > Themes থেকে টগল বন্ধ করা বা শুরুর mode ঠিক করা যায়।
- **Custom theme** বানানোর সময় dark ও light দুই mode-এর রং আলাদাভাবে এডিট করা যায়, লাইভ প্রিভিউ ও কনট্রাস্ট চেকসহ।
- **ইফেক্ট:** ইন্টারঅ্যাকটিভ গ্রেডিয়েন্ট হিরো, শব্দ ধরে হেডলাইন রিভিল, smooth inertial scroll, কাস্টম কার্সর, ম্যাগনেটিক বাটন, scroll-linked প্রসেস লাইন, সার্ভিস রো-তে কার্সর-অনুসারী প্রিভিউ, ক্লিপ-রিভিল ইমেজ, কাউন্টার, মার্কি, টেস্টিমোনিয়াল স্লাইডার। প্রতিটা Admin > Themes > Experience settings থেকে চালু/বন্ধ করা যায়, আর ডিভাইসে "reduce motion" থাকলে সব অ্যানিমেশন নিজে থেকে বন্ধ হয়।
