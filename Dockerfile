# Use Microsoft's official Playwright image as it includes all browser dependencies
# Use a stable Playwright base image as the foundation
FROM mcr.microsoft.com/playwright:v1.49.1-jammy

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install the library version specified in package.json (1.60.0)
RUN npm install

# IMPORTANT: Force Playwright to download the EXACT browsers it needs for 1.60.0
# This fixes the "Executable doesn't exist" error even if the base image is older.
RUN npx playwright install --with-deps chromium

# Copy the rest of the application code
COPY . .

# Set environment variable for port
ENV PORT=3000
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
