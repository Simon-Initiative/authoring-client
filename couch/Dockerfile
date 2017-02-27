FROM klaemo/couchdb:latest
USER root
RUN echo 'couchdb:x:99:99:couchdb:/:/bin/sh' >> /etc/passwd
USER couchdb
COPY ./local.ini /opt/couchdb/etc/local.d/custom.ini

ENTRYPOINT ["/opt/couchdb/bin/couchdb"]