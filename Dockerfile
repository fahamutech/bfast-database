FROM docker:stable
WORKDIR /bfast
RUN apk add nodejs
RUN apk add npm
RUN apk update
CMD ["ls /bfast -lh"]
