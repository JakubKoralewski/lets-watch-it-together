# `/prisma/seeding`

Database seeding

---

If you were to modify the seeding script ([`./initiateDb.ts`](./initiateDb.ts)), 
then follow these steps to correctly re-apply the new data:

 
1. Stop the server if it is running.
2. Reset the database (`npx prisma migrate reset --preview-feature`).
   - This will remove everything in you local database!
4. Start the server and login.
   - this is needed if you want one of the dummy users to send
     you and automatically accept a friend request
   - TODO: this could be unnecessary one day by creating a dummy
     account you could log in with
     - see issue about Heroku Review Apps
5. Stop the server again.
6. Run the seeding script again (`npm run dev-seed`).
7. Profit.

*Note the above isn't usually necessary! Only if you changed that script!*

---

https://github.com/prisma/prisma/issues/9
https://github.com/nextauthjs/next-auth/discussions/1056