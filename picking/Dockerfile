FROM us.icr.io/image-base/int-node-python-oracle:20190722-1
WORKDIR /src
# Provides cached layer for node_modules
ADD package.json /src/
RUN yarn install --production --pure-lockfile
# Define working directory
ADD . /src/

# Define env variables
ENV NODE_ENV 'production'

# Expose port
EXPOSE 3001

# Run app
CMD ["node", "principal.js"]