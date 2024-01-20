# Use a base image with Node.js
FROM node:12.16.3-stretch-slim 

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code into the working directory
COPY . .

# Expose the port on which the Express.js server will listen
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
