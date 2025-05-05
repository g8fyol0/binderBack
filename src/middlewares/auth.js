// const adminAuth = (req, res, next)=>{
//     console.log("admin is getting verified");
//     const token = "xyz";
//     const isAdminAuthorized = token === "xyz";
//     if(!isAdminAuthorized){
//         res.status(401).send("not authorized");
//     }else{
//         next();
//     }
// }

// const userAuth = (req, res, next)=>{
//     console.log("User is getting verified");
//     const token = "xyz";
//     const isAdminAuthorized = token === "xyz";
//     if(!isAdminAuthorized){
//         res.status(401).send("not authorized");
//     }else{
//         next();
//     }
// }

// module.exports = {
//     adminAuth,
//     userAuth
// }