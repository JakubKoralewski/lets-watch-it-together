# `/src/pages/api`

API endpoints reside here. 

Each folder in `pages` directory
maps directly to the URL in which the endpoint/route
will be available at.
 
For example file:
- `/src/pages/api/shows/[id]/like` will map to:
- `/api/shows/[id]/like` 
  - where `[id]` is an integer value corresponding
to the show id to be liked

Check out [`/src/lib/api`](../../lib/api) for the actual 
implementation of these endpoints, as it makes more sense 
for testing to have them as functions.

Check out Nextjs docs regarding Api Routes for
more details.