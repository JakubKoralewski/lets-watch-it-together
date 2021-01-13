# Used in production as well!

# https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile.multistage
# Stage 1: Building the code
FROM mhart/alpine-node:15 AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm i

COPY . .

ENV NODE_ENV=production

RUN npx prisma generate
RUN npm run build
RUN npm i --production
#RUN yarn install --production --frozen-lockfile

RUN apk --no-cache add curl
RUN chmod a+x ./prisma/heroku-release.sh

# Stage 2: And then copy over node_modules, etc from that stage to the smaller base image
FROM mhart/alpine-node:slim-15 as production

COPY --from=builder /usr/bin/curl /usr/bin/curl

WORKDIR /app

# COPY package.json next.config.js .env* ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# For local testing only, Heroku ignores this port
EXPOSE 3000

# https://devcenter.heroku.com/articles/container-registry-and-runtime#testing-an-image-locally
RUN adduser -D myuser
USER myuser

CMD [ ! -z "$HEROKU_APP_NAME" ] && export NEXTAUTH_URL="https://$HEROKU_APP_NAME.herokuapp.com" || echo "error setting env"; node_modules/.bin/next start -p $PORT --hostname 0.0.0.0