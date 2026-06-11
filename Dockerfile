FROM node:22

WORKDIR /app

COPY package.json ./

RUN npm install 

#One dot for the cuurent directory, the other is for the directory inside the container
COPY . . 

RUN npm run build

RUN npx prisma generate

ENV PORT=3000

EXPOSE 3000

CMD [ "npm", "start"]


#4/6 Stopped at migrating the files into the container's db

# Docker Steps After the docker file
# 0..dockerignore the node_modules
#  1. Build the image: docker build -t umar/dam:1.0 . =>
#  -t is the tag, and after it is the name which directory is copying, here we want the root '.'

#  2. Build the container: docker run -p 5000:3000 umar/dam:1.0
#  -p is the port mapping, 5000 what will be in the localhost, 3000 is the continer's, since the files in it has nest on 3000

# 3. Check the container: docker ps => Shows each container id

# 4. Can stop the container: docker stop <container_id>

# 5.Volumes: Shared Files bet all containers:
# docker volume create sharedFolder
    # docker run  --mount soruce=sharedFolder,target=/shared umar/dam:1.0
    # docker run  -v sharedFolder:/shared umar/dam:1.0 ?????


#### What's left before commiting: Docker Compose



