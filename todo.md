-init git
-git ignore
-repo creation
-push code

- order of routes matter a lot

- install postman and set it for our project
- regex and dynamic routers as routes

---

-- multiple route handler and next() function
-- middleware and how express handle request behind the scene
-- error handling using app.use("/", (err, req, res, next)) to handle it gracefully

---

-- connection to mongo cluster using mongoose library
-- create userSchema and model (which provides us an interface to create documents or it's like a class whose instances are documents)
-- /signup router

---

data sanitization at api and schema level
-- use validator library to check email, password, url and other data inputs
-- don't trust REQ.BODY as it can contain malicious data

---

encrypting passwords -- bcrypt pakage and validate signup

---

## routing as middlewares express.router()s

added connection request apis and indexing etc

---

## -- post api is all about putting data in DB where attacker can really mess around

creating link between two schema like user and other using "ref" keyword to create link between two collections ##populate and ref // like sql table references in join

-- user/request/received api done
