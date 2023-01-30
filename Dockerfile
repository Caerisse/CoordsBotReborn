FROM node:18

# Make directory, give user node permissions over it and set the working dir
RUN mkdir -p /home/node/app/node_modules
RUN chown -R node /home/node/app
WORKDIR /home/node/app

# Copy package.json and install dependencies, made first so if package.json didnt change 
# then npm install wont run and will use cached files instead. 
# If npm install is at the bottom it would only use cache if nothing changed
COPY package.json ./
RUN npm install

#Copy the rest of the files
COPY public/ ./public
COPY src/ ./src
COPY pm2.config.js ./
COPY *.json ./
COPY .env.production ./.env

# Start the bot
USER node
EXPOSE 8000
CMD [ "npm", "start" ]