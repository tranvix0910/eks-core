# Step 1: Build React app
FROM public.ecr.aws/docker/library/node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Create React App inlines REACT_APP_* vars into the JS bundle at build time,
# not read at runtime - so this has to be a build ARG, not a container ENV on
# the final nginx image. Was never set at all before (see ProductService.js,
# CartService.js, AuthService.js, ProfileService.js), which sent every API
# call to axios.defaults.baseURL=undefined, i.e. a same-origin relative path
# nginx's try_files caught and answered with index.html - the root cause of
# the homepage crashing on featuredProducts.slice(0,8).map() against an HTML
# string instead of JSON.
ARG REACT_APP_BASE_API_URL
ENV REACT_APP_BASE_API_URL=${REACT_APP_BASE_API_URL}
RUN npm run build

# Step 2: Serve with NGINX
FROM public.ecr.aws/nginx/nginx:stable-alpine

COPY --from=builder /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]