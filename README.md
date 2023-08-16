# Camagru

instagram-like web application

### stack

- nodejs
- javascript
- postgresql

## local deployment

It is a containerized application.

### development

To deploy it locally for development just run:

```sh
docker compose -f docker-compose.dev.yml up
```

It will use 3 docker images:

- node - alpine - 176MB
- postgresql - alpine - 236MB
- adminer - linuxkit - 250MB

adminer is a php service to manage database, accessible through `localhost:8080`.

node image is used to build 2 development containers: front and back.

Front-end hmr development server is backed by vitejs and back-end with nodemon,
so the edited files on the host which are mapped into the containers, triggers a
server reload when changed.

Finally the postgresql image is a database service used to serve data from
a docker volume.

### production

in progress.

I will build some multi-stage images. For example, build the front-end with vitejs
then move the result into an nginx image which will be dedicated to serve the
freshly built static files.
