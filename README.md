# authoring-experiments

A project to use for experiments and proof of concepts 
in authoring tools / approaches.

## What it currently investigates

1. Draft.js as a component to provide core editing functionality
2. Approach for a pluggable framework for embedding custom activity types
3. Feasibility of Draft.js to provide advanced editing features (e.g. direct editing of embedded content)
4. Workflow for model translation, persistence and retrieval.

Right now this is a simple application that allows a user to create
and edit pages, style the text within those pages, and embed media.
Also included is the ability to create and embed a custom activity type.
For simplicity's sake, this activity type is just a true-false question.

## To run

```
$ docker-compose up
```

Then open a web browser at `http://localhost:9000/index.html`

Data persistence is provided by CouchDB.  Once everything is running you
can view the couch web console at `http://localhost:5984`

