# Stage 1: Build the Node.js app
FROM node:20-alpine as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy all the source code to the container
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the TypeScript application
RUN npm run build

# Stage 2: Run the built application in a minimal environment
FROM node:20-alpine

WORKDIR /app

# Copy the built application from the first stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules

# Expose the port
EXPOSE 3000

# Command to run tests
CMD ["npm", "test"]
