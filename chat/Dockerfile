# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (only package.json for caching)
COPY package.json package-lock.json* ./

RUN npm install

# Copy the rest of the code
COPY . .

# Expose Next.js default port
EXPOSE 3000

# Run Next.js dev server with hot reload
CMD ["npm", "run", "dev"]
