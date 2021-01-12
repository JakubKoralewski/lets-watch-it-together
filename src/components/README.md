# `/src/components`

This is the place you will find React
components. Check out [`/src/pages`](../pages)
because it is the source of truth, or the root
node from which you can trace back
which components are used where.

Check out React docs for more details.

## Rules for creating components

The naming/placement convention is as follows:

1. If the component is supposed to be used everywhere then place it in
   this directory.
2. If the component is *domain* (e.g. user, show, meeting, friend request) specific
   then put it in a directory named like the *domain*
3. If the component is page specific then put it in the [`./pages`](./pages)
   directory inside another directory named rightly for that page.