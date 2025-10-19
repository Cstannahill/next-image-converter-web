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

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Using a server-side proxy for API key security

To keep your backend API key secret, deploy a server-side proxy (already included at `src/app/api/proxy/[...rest]/route.ts`) and set the server-only environment variable in Vercel:

1. Go to your Vercel project dashboard → Settings → Environment Variables.
2. Add a variable named `API_KEY` with the secret value (set to Production/Preview/Development as appropriate).
3. Ensure your frontend uses the proxy path (for example, set `NEXT_PUBLIC_API_BASE_URL` to `/api/proxy` in your Vercel env vars or in `.env` during local development).

Notes:

- `API_KEY` is only available server-side. The proxy injects `X-API-Key` into outbound requests to the backend so the key is never exposed to browsers.
- If you need to call the backend directly from the browser, you must not store the secret key in a client-visible env var (`NEXT_PUBLIC_...`) because it will be embedded in the build.
