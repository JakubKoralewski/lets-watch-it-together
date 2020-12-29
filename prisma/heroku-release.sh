# This runs on the Dockerfile.worker Alpine Linux before the
# deployment on Heroku
npx prisma migrate deploy --preview-feature
npx prisma generate
