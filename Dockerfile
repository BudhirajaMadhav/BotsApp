FROM princemendiratta/botsapp:latest

WORKDIR /

COPY . /BotsApp

WORKDIR /BotsApp

RUN git init --initial-branch=railway

RUN git remote add origin https://github.com/BudhirajaMadhav/BotsApp.git

RUN git fetch origin railway

RUN git reset --hard origin/railway

RUN yarn

# RUN cp -r /root/Baileys/lib /BotsApp/node_modules/@adiwajshing/baileys/

CMD [ "npm", "start"]