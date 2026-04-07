FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY turbo.json ./

# Copy the API app content
COPY apps/api ./apps/api
COPY packages ./packages

# Install dependencies for the local workspace
RUN npm install

# Generate Prisma Client
WORKDIR /app/apps/api
RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "run", "dev"]
