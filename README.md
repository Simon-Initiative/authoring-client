# course-editor

NextGen course editor.

## To run

```
$ docker-compose up
```

Then open a web browser at `http://localhost:8888/index.html`

Data persistence is provided by CouchDB.  Once everything is running you
can view the couch web console at `http://localhost:5984`

An HAProxy instance sits in front of both the CouchDB and the webpack dev server.
This is to eliminate all cross domain requests.
