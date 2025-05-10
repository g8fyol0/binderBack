--binder apis

// we can group in any order but we should do this logically 
// we will create AUTH router and add these three api in that router
## auth router
-- POST /signup
-- POST /login
-- POST /logout

// all these will be handled by auth router i.e. whenever request comes at /login logic of it will be written in auth router

## PROFILE router
-- GET /profile/view (view the profile)
-- PATCH /profile/edit (updating the profile) [gender, age, photoUrl, skills]
-- PATCH /profile/password (to edit password)


## connectionRequestRouter
-- status for a connection request (ignore, intrested, accepeted, rejected)
-- POST /request/send/intrested/:userId
-- POST /request/send/ignored/:userId
-- POST /request/review/accepted/:requestId
-- POST /request/review/rejected/:requestId


## User router 
-- GET /user/connections
-- GET /user/requests
-- GET /user/feed (gives atleast 20 user profile on the platform if all exhausted then again call it) 



