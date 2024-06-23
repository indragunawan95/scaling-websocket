# Dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy app source code
COPY websocket-server .
RUN npm install
RUN npx prisma generate
RUN npm run build

# Expose the application port
EXPOSE 8080

# Command to run the application
CMD ["npm", "run", "start:prod"]
