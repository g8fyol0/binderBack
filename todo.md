- order of routes matter a lot

- install postman and set it for our project
- regex and dynamic routers as routes

---

-- multiple route handler and next() function
-- middleware and how express handle request behind the scene
-- error handling using app.use("/", (err, req, res, next)) to handle it gracefully

---

-- connection to mongo

-- /signup router

---

## -- various other router setup

---

## routing express.router()s

added connection request apis and indexing etc

---

## -- post api is all about putting data in DB where attacker can really mess around

creating link between two schema like user and other c- link between two collections ##populate and ref // like sql table references in join

-- user/request/received api done

---

<!-- feed api done
 -> only view 10 user at a time not send all the data at a time

/feed?page=1&limit=10 -> gives first 10 users 1-10 .skip(0).limit(10)
/feed?page=2&limit=10 -> gives user from 11-20 .skip(10).limit(10)
/feed?page=3&limit=10 -> gives user from 21-30 .skip(20).limit(10)

.skip() -> how many documents to skip from the start
.limit() -> how many documents we want
skip = (pageNo - 1)\* limit -->

================
backend is almost done hoohhhhh
