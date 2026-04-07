FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY turbo.json ./

# Copy the Web app and workspace parts
COPY apps/web ./apps/web
COPY packages ./packages

# Install dependencies
RUN npm install

WORKDIR /app/apps/web
EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
