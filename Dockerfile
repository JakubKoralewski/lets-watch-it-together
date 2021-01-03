# Used in production as well!

# https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile.multistage
# Stage 1: Building the code
FROM mhart/alpine-node AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm i

COPY . .

ENV NODE_ENV=production

RUN npm run build
RUN npx prisma generate
RUN npm i --production
#RUN yarn install --production --frozen-lockfile

RUN apk --no-cache add curl
RUN chmod a+x ./prisma/heroku-release.sh

# Stage 2: And then copy over node_modules, etc from that stage to the smaller base image
FROM mhart/alpine-node:slim as production

COPY --from=builder /usr/bin/curl /usr/bin/curl

WORKDIR /app

# COPY package.json next.config.js .env* ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

# https://devcenter.heroku.com/articles/container-registry-and-runtime#testing-an-image-locally
RUN adduser -D myuser
USER myuser
# Dunno where to put this
# This is for review apps in Heroku to have the NEXTAUTH_URL environment variable
# It has || true at the end because if there is no HEROKU_APP_NAME the exit code is 1 and the whole Docker build breaks
#RUN /bin/sh -c "([ ! -z \"$HEROKU_APP_NAME\" ] && export NEXTAUTH_URL=\"https://$HEROKU_APP_NAME.herokuapp.com\") || true"
#RUN /bin/sh -c "echo \"NEXTAUTH_URL: $NEXTAUTH_URL\""

CMD node_modules/.bin/next start -p $PORT --hostname 0.0.0.0