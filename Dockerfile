FROM node:alpine3.20

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build


#Serve with Nginx
 FROM nginx:1.23-alpine

 WORKDIR /user/share/nginx/html

 RUN rm -rf *

 COPY --from=build /app/build .
 
 EXPOSE 80

 ENTRYPOINT [ "nginx","-g","daemon off" ]