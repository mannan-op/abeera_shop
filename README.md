# Abeera

Contemporary fashion storefront built with Next.js.

## Production catalog seed

`GET /api/products` stays empty until the catalog is seeded. Set `SEED_TOKEN` on the API service, then call the seed once. The route runs the same upsert as `apps/api/prisma/seed.ts` (`catalog-seed.json`). If `SEED_TOKEN` is unset, the route responds with 404. A wrong token responds with 403. Running it again upserts the same products.

```bash
curl -sS -X POST https://abeera-api.onrender.com/api/admin/seed \
  -H "Authorization: Bearer $SEED_TOKEN"
```

`X-Seed-Token: $SEED_TOKEN` is accepted as well. Set `ADMIN_SEED_PASSWORD` before seeding so the `admin@abeera.pk` user does not keep the repo default.
