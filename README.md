This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

This project is deployed on [Vercel](https://vercel.com), connected to this GitHub repo for automatic deploys on push to `main`.

**Known issue:** Next.js 16.2.x currently hits a bug in Vercel's *remote* build pipeline (their build machines fail applying Next's built-in Vercel adapter, even though local builds succeed). Until Vercel ships a fix, deploy manually instead of relying on the automatic git-push build:

```bash
npx vercel build --prod
npx vercel deploy --prebuilt --prod
```

This builds locally and uploads the finished output directly, skipping Vercel's broken remote build step. The first time, you'll also need to run `npx vercel login` and `npx vercel link` to authenticate and connect this folder to the Vercel project.
