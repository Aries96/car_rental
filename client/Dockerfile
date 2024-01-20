# Use a base image with Node.js
FROM node:12.16.3-stretch-slim as build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code into the working directory
COPY . .

# Build the React app
RUN npm run build

# Use a lighter image for deployment
FROM nginx:stable-alpine

# Copy static files from the React build into the Nginx server
COPY --from=build /app/build /usr/share/nginx/html

COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port on which Nginx will listen
EXPOSE 80

# The default Nginx start command will be automatically executed when the container is started
CMD ["nginx", "-g", "daemon off;"]