FROM node:22-alpine

WORKDIR /app

COPY --chown=node:node package.json server.js ./
COPY --chown=node:node public ./public
COPY --chown=node:node data ./data

ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_FILE=/app/data/tarefas.json

EXPOSE 3000

USER node

CMD ["node", "server.js"]

