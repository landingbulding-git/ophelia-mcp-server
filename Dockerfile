# Use Microsoft's official Playwright image as it includes all browser dependencies
FROM mcr.microsoft.com/playwright:v1.49.1-noble

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Set environment variable for port
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
