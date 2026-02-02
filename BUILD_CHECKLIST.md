# Build Verification Checklist

## Before Declaring "Done":
- [ ] Run `npm run build` locally
- [ ] Verify no TypeScript errors
- [ ] Check all API routes compile
- [ ] Test auth flow (login → dashboard)
- [ ] Verify database initializes
- [ ] Test one full blog generation

## Common Issues to Check:
1. NextAuth v5 uses `auth()` not `getServerSession()`
2. API routes use `handlers` export from auth.ts
3. Database path exists (./data/ directory)
4. Environment variables set (.env.local)
5. No type mismatches in API routes

## Build Command:
```bash
cd ~/Projects/nextjs-blog && npm run build
```

## Verification Commands:
```bash
# Check auth
curl http://localhost:3000/api/auth/providers

# Check API
curl http://localhost:3000/api/posts

# Check DB
ls -la data/app.db
```
