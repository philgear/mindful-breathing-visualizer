# Use Nginx Alpine for lightweight serving
FROM nginx:alpine

# Copy static assets (Vanilla JS Implementation)
COPY frontend/vanilla-js/ /usr/share/nginx/html/

# Expose Port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
