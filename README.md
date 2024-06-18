# scaling-websocket


# load balancer
## Haproxy
Client need to have transport: ['websocket'] or using cookie, but I can't make suing cookie work.
Client transport: ['websocket'] somehow only stick to 1 web socket server.

## NGINX
Using $remote_addr, IP address as hash to make connection sticky.

# Redis Adapter
We can use Redis adapter for in memory proses move to redis.
