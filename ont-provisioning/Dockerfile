FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY . .
USER node
EXPOSE 3000
# Sincroniza esquema, siembra datos iniciales y arranca
CMD ["sh", "-c", "npm run db:push && npm run seed && npm start"]
