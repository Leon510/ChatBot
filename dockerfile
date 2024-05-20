# Definieren Sie das Basisimage
FROM node:18

# Erstellen Sie ein Arbeitsverzeichnis
WORKDIR /

# Kopieren Sie die package.json und package-lock.json
COPY package*.json ./

# Installieren Sie die Abhängigkeiten
RUN npm install

# Kopieren Sie den Rest des Codes
COPY . .

# Expose the port
EXPOSE 3000

# Definieren Sie den Startbefehl
CMD [ "node", "/src/index.js" ]