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

 docker run -e DATABASE_URL= -e SECRET= -e API_TOOLKIT= -e REDIS_PASSWORD= -e REDIS_DB= -e REDIS_HOST= -e REDIS_PORT= -p 8000:8000 <image_name>
```