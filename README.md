# lets-watch-it-together [![](https://img.shields.io/badge/Wiki-Notion-%23000)](https://www.notion.so/jcubed/Let-s-Watch-It-Together-Wiki-881515aba11241eaa43e7a9428419d81) [![GitHub Workflow Status](https://img.shields.io/github/workflow/status/JakubKoralewski/lets-watch-it-together/test?label=tests)](https://github.com/JakubKoralewski/lets-watch-it-together/actions?query=workflow%3Atest) [![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

RUP University Project

Live at https://lets-watch-it-together.herokuapp.com

## Contributing

Check out [.env.local](.env.local), you may have to fill some of those environment
variables, and copy them to `.env` (because Prisma doesn't detect the `.env.local` file).

This includes:
- the GitHub OAuth app (id and secret) for **local development**
   - for login
   
Read the [Let's Watch It Together Wiki](https://www.notion.so/jcubed/Let-s-Watch-It-Together-Wiki-881515aba11241eaa43e7a9428419d81)
for more information regarding the implementation.

### Development

This is when you have Node.js and Docker installed.
Make sure Docker is running.

```bash
$ npm install
$ docker-compose up --detach
$ npm run dev
```

Then once you're finished, tear down the PostgreSQL and Redis containers.
```bash
$ docker-compose down
```

### Production

Make sure you have Docker installed. Then run:

```bash
$ docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

### Testing

```bash
$ npm run test
```