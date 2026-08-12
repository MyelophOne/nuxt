FROM node:slim

RUN apt-get update && apt-get install -y \
	git curl bash ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /app