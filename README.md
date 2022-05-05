# Task

> Goals:
> 
> We need to restrict the usage of our API to prevent users from abusing our system. These are the conditions/requirements:
> 
> 1. Implement a basic auth middleware. It could be just an uuid token passed in headers, or it could be a jwt. No need to implement login/register routes. You can just store the token somewhere (env, app, db).
> 2. Implement 2 types of routes: public and private. Private routes should use the auth middleware.
> 3. Implement a rate limiter. It should check a token limit for private routes and a ip limit for public routes.
> 4. Set a rate limit by token to 200 req/hour
> 5. Set a rate limit by ip to 100 req/hour
> 6. Those numbers (token limit and ip limit) should be configurable from the environment
> 7. When a user reaches the limit, in the response show an error message about current limit for that user account, and display when (time) the user can make the next request
> 8. **Keep concurrency in mind**
> 9. _Bonus_: keep performance in mind.
> 10. _Optional task_: Create a different weight of request rate for every URL: 1/2/5 points per request (you can assume we have 5 different end points) depending on end point.
> 
> Allowed stack includes:
> - Node.js using Express or Nest.js.
> - MongoDB
> - Redis
> 
> Feel free to use additional services, except ready limiter libraries.
> 
> Output:
> - Source code of the implementation

## How to Run locally

[//]: # (TODO: Docker, production like setup)
[//]: # (TODO: config for prod not in .gitignore)
[//]: # (TODO: tests point by point)
[//]: # (TODO: redis?)
[//]: # (TODO: style formatting)
[//]: # (TODO: Readme - howto)
[//]: # (TODO: cleanup used libraries)

```shell
npm install  \
  && npm run build \
  && npm run start:prod
```

```shell
echo "Private token demo, token Wu9Mae7U"
for i in $(seq 1 200); do 
echo $i;
curl -H 'Authentication: Wu9Mae7U' 'http://127.0.0.1:3000/private/1' && echo;
done
echo "Next request, same token - should be denied"
curl -H 'Authentication: Wu9Mae7U' 'http://127.0.0.1:3000/private/1' && echo;
echo "Now try with different token ohwe9Sec" 
curl -H 'Authentication: ohwe9Sec' 'http://127.0.0.1:3000/private/1' && echo;
``` 

```shell
echo "Public IP demo"
for i in $(seq 1 100); do 
echo $i;
curl 'http://127.0.0.1:3000/public/1' && echo;
done
echo "Next request, same IP"
curl 'http://127.0.0.1:3000/public/1' && echo;
``` 

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e
```

