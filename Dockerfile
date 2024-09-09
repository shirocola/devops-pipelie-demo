# Stage 1: Build the Node.js app
FROM node:20-alpine as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy all the source code to the container
COPY . .

# Build the TypeScript application
RUN npm run build

# Stage 2: Run the built application
FROM node:20-alpine

WORKDIR /app

# Copy the built application from the first stage
COPY --from=build /app/dist ./dist

# Copy the package.json and install only production dependencies
COPY package.json package-lock.json ./
RUN npm install --production

# Expose the port
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
