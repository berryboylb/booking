# Booking

Booking is a simple app built on top of express and graphQL, to allow people create services,schedules and book services easily.


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