# `/prisma/seeding`

Database seeding

If you were to modify the seeding script ([`./initiateDb.ts`](./initiateDb.ts)) 
you will need to stop the server, reset the database (`npx prisma migrate reset --preview-feature`),
and only then run the seeding script again (`npm run dev-seed`).

https://github.com/prisma/prisma/issues/9
https://github.com/nextauthjs/next-auth/discussions/1056