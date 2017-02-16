# enable CORS

# curl -sX PUT http://su:su@localhost:5986/_config/httpd/enable_cors -d '"true"' 1>/dev/null
# curl -sX PUT http://su:su@localhost:5986/_config/cors/origins -d '"*"' 1>/dev/null
# curl -sX PUT http://su:su@localhost:5986/_config/cors/credentials -d '"true"' 1>/dev/null
# curl -sX PUT http://su:su@localhost:5986/_config/cors/methods -d '"GET, PUT, POST, HEAD, DELETE"' 1>/dev/null
# curl -sX PUT http://su:su@localhost:5986/_config/cors/headers -d '"accept, authorization, content-type, origin, referer, x-csrf-token"' 1>/dev/null
  


# create two test users
curl -X PUT http://su:su@localhost:5984/_users/org.couchdb.user:user1 \
    -H "Accept: application/json" \
    -H "Content-Type: application/json" \
    -d '{"name": "user1", "password": "user1", "roles": [], "type": "user"}'

curl -X PUT http://su:su@localhost:5984/_users/org.couchdb.user:user2 \
    -H "Accept: application/json" \
    -H "Content-Type: application/json" \
    -d '{"name": "user2", "password": "user2", "roles": [], "type": "user"}'

# create the database
curl -X PUT http://su:su@localhost:5984/editor -H "Accept: application/json"

# create the security document for the database
curl -X PUT http://su:su@localhost:5984/editor/_security \
    -H "Content-Type: application/json" \
    -d '{"admins": { "names": [], "roles": [] }, "members": { "names": ["user1", "user2"], "roles": [] } }'