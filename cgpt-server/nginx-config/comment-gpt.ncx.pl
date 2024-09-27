server {
	server_name comment-gpt.ncx.pl;
	client_body_timeout 1200;
	client_header_timeout 1200;
	send_timeout 1200;
	keepalive_timeout 1200;
        
	location / {
                proxy_pass http://127.0.0.1:3000;
                proxy_set_header Host $host;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_connect_timeout 1200s;
		proxy_send_timeout 1200s;
		proxy_read_timeout 1200s;
		send_timeout 1200s;
		keepalive_timeout 1200s;

		fastcgi_connect_timeout 1200s;
		fastcgi_send_timeout 1200s;
		fastcgi_read_timeout 1200s;
        }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/comment-gpt.ncx.pl/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/comment-gpt.ncx.pl/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
server {
    if ($host = comment-gpt.ncx.pl) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


        listen 80;
	server_name comment-gpt.ncx.pl;
    return 404; # managed by Certbot


}