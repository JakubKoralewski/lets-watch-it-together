# `/prisma`

This directory is responsible for anything
that has to do with the database, including:

- [migrations](./migrations)
- [seeding](./seeding)
- [the schema](./schema.prisma)

The [`./schema.prisma`](./schema.prisma) is meant to be the source
of truth of the whole model. Prisma allows manually modifying the
migrations to access some database-specific functions like
Full Text Search in Postgres etc. so you might still need to check
out the migrations folder to have an accurate representation of
how the database is set up.

Check out Prisma Docs for more details.