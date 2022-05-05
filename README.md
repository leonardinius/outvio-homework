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

## Summary, Guide to the homework

The minimal MVP of the task, using NestJS framework.
Included:
- task 10 points
- e2e tests, tdd by these (see `How to run test suite`)
- few unit tests
- Docker, docker-compose setup
- few Shell scripts for system acceptance (see `System E2E shell tests`)

Not included:
- database (redis, mongo) ratelimit counter storage.

## Known issues & shortcuts

- The code _likely_ is not idiomatic Typescript, these are literally first lines of Typescript in my life. 
  I expect there may be also violations of module / filename naming; tried to be consistent with 
  the nestjs starter app, can not judge how well succeed.  
  Really enjoyed it though and Nest.js is 🔥, liked it more than Java Spring / Spring Boot.
- Dependency injection: the solution I came by feels "dirty" & shortcut, 
  e.g. the fact I created separate classes for public & private routes and way env variables 
  are retrieved in constructor and e2e tests. This part could be improved.
- Operations: put configuration to src/config/config.yaml, committed to VCS. 
  In real life would store the tokens in encrypted secrets or secrets service (eg AWS KMS).
- Used in memory storage for the ratelimit counters.
  For distributed mService I would insist on using redis as backend for storage, 
  or better yet to not implement that at all and put API Gateway (eg Kong) in front of service.
- When run e2e tests, was required to use `--forceExit --detectOpenHandles`, 
  google found multiple cases with no clear goto solution how to troubleshoot that efficiently.
  It likely points to some potential issue/hole in my async ratelimit middleware, 
  could not locate the root cause yet.
  Would not leave it for production, however worth to mention here. 

## Code structure

```text
src
├── app.module.ts                                      # app main module
├── auth                                               # private token middleware
│   └── auth.middleware.ts                             
├── clock                                              # utility for clock/time, to swap out in tests
│   ├── clock.interface.ts                             
│   ├── system-clock.class.ts                          
│   └── test-clock.class.ts                            
├── config                                             # configuration in yaml files
│   ├── config-dev.yaml                                
│   ├── config-test.yaml                               
│   ├── config.yaml                                    
│   └── configuration.ts                               
├── main.ts                                            # app entry point
├── private.controller.spec.ts                         # below controllers and unit tests for these
├── private.controller.ts                              
├── pub.controller.spec.ts                             
├── pub.controller.ts                                  
└── ratelimit                                          # rate limit middleware
    ├── ratelimit-ip.middleware.service.ts             # private token ratelimit
    ├── ratelimit-token.middleware.service.ts          # public ip ratelimit
    ├── ratelimit.middleware.service.ts                # reusable base class / base service
    ├── storage-inmem.service.ts                       # in memory storage 
    ├── storage-inmem.spec.ts
    ├── storage.interface.ts
    └── tracker.interface.ts                           # request to ratelimit key interface
```
## How to run locally

### How to run test suite

Please note, the e2e contains the minimal set of acceptance criteria for the task.

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e
```

### How to run natively on the host


```bash
# development
$ npm install && npm run start

# or in production mode
$ npm install && npm run build && npm run start:prod
```

### How to run in docker

```bash
$ docker compose build 
$ docker compose up
```

## System E2E shell tests {#system-shell-tests}

### Private token demo

Run the following

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

The expected outcome
```text
...
199
Private Ok - 1
200
Private Ok - 1
Next request, same token - should be denied
{"message":"Too Many requests","retry-after-seconds":"3599","limit":"200","period":"3600"}
Now try with different token ohwe9Sec
Private Ok - 1
```

### Public IP demo

Run the following:

```shell
echo "Public IP demo"
for i in $(seq 1 100); do 
echo $i;
curl 'http://127.0.0.1:3000/public/1' && echo;
done
echo "Next request, same IP"
curl 'http://127.0.0.1:3000/public/1' && echo;
``` 

Expected outcome:

```text
..
99
Public Ok - 1
100
Public Ok - 1
Next request, same IP
{"message":"Too Many requests","retry-after-seconds":"3600","limit":"100","period":"3600"}
```

## Config

See the following files

```text
src/config
├── config-dev.yaml  # local development
├── config-test.yaml # used in tests
└──config.yaml       # production
```