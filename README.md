# lets-watch-it-together [![](https://img.shields.io/badge/Wiki-Notion-%23000)](https://www.notion.so/jcubed/Let-s-Watch-It-Together-Wiki-881515aba11241eaa43e7a9428419d81) [![GitHub Workflow Status](https://img.shields.io/github/workflow/status/JakubKoralewski/lets-watch-it-together/test?label=tests)](https://github.com/JakubKoralewski/lets-watch-it-together/actions?query=workflow%3Atest) [![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

RUP University Project

Live at https://lets-watch-it-together.herokuapp.com

Read the [Let's Watch It Together Wiki](https://www.notion.so/jcubed/Let-s-Watch-It-Together-Wiki-881515aba11241eaa43e7a9428419d81)
for more information regarding the implementation.

## Contributing

Check out [.env.example](.env.example) file, you have to fill some of those environment
variables, and copy them to `.env` (and create it if it doesn't exist).

This includes:
- `GITHUB_ID` and `GITHUB_SECRET`
    - the GitHub OAuth app credentials for login to work,
    - you may create a GitHub OAuth app yourself or
      contact @JakubKoralewski for those credentials
- `TMDB_API_KEY`
    - to be able to talk to TMDB API
    - you need to create a TMDB account at `https://themoviedb.org` and copy
      the `v3 auth` key from `https://www.themoviedb.org/settings/api`
- potentially more if this README wasn't updated
   

### Development

This is when you have Node.js and Docker installed.
Make sure Docker is running.
Set `NODE_ENV` to `development` to disable PWA.

1. Install Node dependencies:

    Only required first time you run, or when dependencies change.

    ```bash
    $ npm install
    ```

2. Start PostgreSQL and Redis containers in Docker:

    #### Option A

    When you want the `docker-compose` command to run in the background:

    ```bash
    $ docker-compose up --detach
    ```

    #### Option B

    To see the output of `docker-compose`. You will need to run 
    the commands after this one in another terminal window.

    ```bash
    $ docker-compose up
    ```

3. Run migrations:

    Only required first time the database is run, or when new migrations
    are added. Since the Docker setup in `docker-compose.yml` currently does
    not use volumes for peristence right now this may need to be done after
    every `docker-compose up`?

    ```bash
    $ npx prisma migrate dev --preview-feature
    ```

4. Start the Next.js app in development mode (with live reload):

    ```bash
    $ npm run dev
    ```
   
5. Tear down database and cache.

    If used Option A, then once you're finished, tear down the PostgreSQL and Redis containers: 
    ```bash
    $ docker-compose down
    ```
   
    Else just hit Ctrl+C if run Option B.

### Database schema changes

If you changed the schema inside `prisma/schema.prisma` you need to save those changes
as SQL migrations for other developers to replay those changes on their databases as well:

```bash
$ npx prisma migrate dev --name a-descriptive-name-of-the-thing-you-changed --preview-feature
```

where `a-descriptive-name-of-the-thing-you-changed` is a descriptive name of the thing you changed
inside the database schema, e.g. `dropped-the-database-because-its-stupid`.

### Production

To see how the container runs in production you may want to run these commands.
Make sure you have Docker installed. Then run:

```bash
$ docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

### Testing

To run tests:

```bash
$ npm run test
```