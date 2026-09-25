FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package descriptors
COPY package*.json .npmrc* ./

# Install production dependencies fast
RUN npm install --omit=dev --no-audit

# Copy source code
COPY . .

# Expose HTTP port
EXPOSE 3000

# Set non-root user for security best practice
USER node

CMD ["node", "src/server.js"]
