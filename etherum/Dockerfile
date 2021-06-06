FROM ethereum/client-go

EXPOSE 8545

RUN apk update --no-cache \
    && apk upgrade --no-cache \
    && apk add --no-cache bash

ENTRYPOINT ["geth"]