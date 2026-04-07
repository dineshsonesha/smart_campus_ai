FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY turbo.json ./

# Copy the Worker app and necessary workspace parts
COPY apps/worker ./apps/worker
COPY apps/api/prisma ./apps/api/prisma
COPY packages ./packages

# Install dependencies
RUN npm install

# Generate Prisma directly for the worker
WORKDIR /app/apps/worker
RUN npx prisma generate --schema=../api/prisma/schema.prisma

CMD ["npm", "run", "dev"]
