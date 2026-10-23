process.env.DATABASE_URL ??=
  "postgresql://postgres:password@localhost:5432/abeera?schema=public";
process.env.REDIS_URL ??= "redis://127.0.0.1:6379";
process.env.JWT_ACCESS_SECRET ??= "test-access-secret-at-least-32-chars";
process.env.JWT_REFRESH_SECRET ??= "test-refresh-secret-at-least-32-chars";
if (!process.env.NODE_ENV || process.env.NODE_ENV === "test") {
  process.env.NODE_ENV = "development";
}
