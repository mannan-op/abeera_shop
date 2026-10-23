FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci

COPY apps/api apps/api
COPY packages/shared packages/shared
COPY turbo.json ./

RUN npm run build --workspace=@abeera/shared \
  && npm run db:generate --workspace=@abeera/api \
  && npm run build --workspace=@abeera/api

ENV NODE_ENV=production
EXPOSE 3001

CMD ["sh", "-c", "npm run db:migrate --workspace=@abeera/api && npm run start:prod --workspace=@abeera/api"]
