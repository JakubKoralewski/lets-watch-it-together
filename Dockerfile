# https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile.multistage
# Stage 1: Building the code
FROM mhart/alpine-node AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm i

COPY . .

ENV NODE_ENV=production

RUN npm run build
RUN npm i --production
#RUN yarn install --production --frozen-lockfile


# Stage 2: And then copy over node_modules, etc from that stage to the smaller base image
FROM mhart/alpine-node:slim as production

WORKDIR /app

# COPY package.json next.config.js .env* ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node_modules/.bin/next", "start"]