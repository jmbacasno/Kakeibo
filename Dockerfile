FROM node:22-slim

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./
COPY server/infrastructure/database/prisma ./server/infrastructure/database/prisma

RUN npm install

RUN npx prisma generate --schema=server/infrastructure/database/prisma/schema.prisma

COPY . .

RUN npm run build

RUN mkdir -p /app/data

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy --schema=server/infrastructure/database/prisma/schema.prisma && npx tsx server/infrastructure/database/prisma/seed.ts && npx tsx server/index.ts"]
