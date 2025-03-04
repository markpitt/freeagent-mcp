FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source files
COPY . .

# Build TypeScript
RUN npm run build

# Set executable permissions for the start script
RUN chmod +x build/index.js

# Set environment variables
ENV NODE_ENV=production

# Run the server
CMD ["node", "build/index.js"]
