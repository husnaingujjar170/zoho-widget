# Zoho CRM Widget - Next.js

This is a Next.js application that integrates with Zoho CRM to display Contacts and Leads.

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

This app must be accessed through Zoho CRM widget. It cannot run on localhost directly.

1. Use ngrok to expose your local server: `ngrok http 3000`
2. Or deploy to a public URL (Vercel, etc.)
3. Add the public URL to your Zoho CRM widget settings

## Features

- Displays current user information from Zoho CRM
- Lists all Contacts from Zoho CRM
- Lists all Leads from Zoho CRM

