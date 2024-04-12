# Booking

simple booking with graphql


## Setup Locally

```bash
 git clone https://github.com/berryboylb/booking

 cd booking

 pnpm install

 pnpm dev
```


## Setup docker image

```bash
 docker build -t <image_name> .

 docker run -e DATABASE_URL= SECRET= API_TOOLKIT= REDIS_PASSWORD="" REDIS_DB=0 REDIS_HOST= REDIS_PORT= NODE_ENV= <docker-port>:<local-port> <image_name>
```