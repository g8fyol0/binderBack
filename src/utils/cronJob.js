const cron = require("node-cron");
const sendEmail = require("./sendEmail");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const ConnectionRequestModel = require("../models/connectionRequest");
// for scheduled tasks
cron.schedule("0 8 * * *", async () => {
  //send email to all people who got request previous day at 8:00 am
  try {
    const yesterday = subDays(new Date(), 1);
    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);

    const pendingRequests = await ConnectionRequestModel.find({
      status: "interested",
      createdAt: {
        $gte: yesterdayStart,
        $lt: yesterdayEnd,
      },
    }).populate("fromUserId toUserId");

    const listOfEmails = [
      ...new Set(pendingRequests.map((req) => req.toUserId.emailId)),
    ];
    console.log(listOfEmails);

    for (const email of listOfEmails) {
      //send emails to these toUserId.emailId
      try {
        const res = await sendEmail.run(
          "new pending request for " + email,
          "checkout varoious pending friend request at g8fyolprojects.xyz please login and review these requests"
        );
        console.log(res);
      } catch (err) {
        console.log(err);
      }
    }
  } catch (err) {
    console.error(err);
  }
});
