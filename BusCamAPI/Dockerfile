FROM node:14.17.1

# Create and change tha work directory
WORKDIR /app

# copy only 'package.json' and 'package-lock.json' to the work directory
COPY package*.json ./

# run command to install neccessary packages
RUN npm install --production

# copy all local files to the work directory
COPY . ./

# run command at startup
CMD ["npm", "start"]