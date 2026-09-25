FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package descriptors
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose HTTP port
EXPOSE 3000

# Set non-root user for security best practice
USER node

CMD ["node", "src/server.js"]
