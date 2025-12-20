
import Agenda from "agenda";
import NotificationTemplate from "../models/Notificationtemplate.js";
import NotificationPreference from "../models/Notificationprefrence.js";
import Notification from "../models/Notification.js";
import { generateLeaderboardSnapshot } from "../utils/gamification/leaderboardservice.js";

let agenda;

export const startAgenda = async (io) => {
  agenda = new Agenda({
    db: {
      address: process.env.MONGODB_URL,
      collection: "agendaJobs",
    },
  });

  // ---------------- DAILY ----------------
  agenda.define("send-daily-notifications", async () => {
    const users = await NotificationPreference.find({ frequency: "daily" });

    for (const user of users) {
      // stage-based template selection
      const template = await NotificationTemplate.findOne({
        type: "daily",
        category: user.category,      // baby/pregnancy/men
        stageType: user.stageType,    // month/year/trimester/general
        stageValue: user.stageValue,  // 1 year or 3rd trimester etc.
      });

      if (!template) continue;

      const notification = await Notification.create({
        userId: user.userId,
        title: template.title,
        message: template.message,
        type: "daily",
      });

      io.to(user.userId.toString()).emit("notification", notification);
    }
  });

  // ---------------- WEEKLY ----------------
  agenda.define("send-weekly-notifications", async () => {
    const users = await NotificationPreference.find({ frequency: "weekly" });

    for (const user of users) {
      const template = await NotificationTemplate.findOne({
        type: "weekly",
        category: user.category,
        stageType: user.stageType,
        stageValue: user.stageValue,
      });

      if (!template) continue;

      const notification = await Notification.create({
        userId: user.userId,
        title: template.title,
        message: template.message,
        type: "weekly",
      });

      io.to(user.userId.toString()).emit("notification", notification);
    }
  });

  // ---------------- MONTHLY ----------------
  agenda.define("send-monthly-notifications", async () => {
    const users = await NotificationPreference.find({ frequency: "monthly" });

    for (const user of users) {
      const template = await NotificationTemplate.findOne({
        type: "monthly",
        category: user.category,
        stageType: user.stageType,
        stageValue: user.stageValue,
      });

      if (!template) continue;

      const notification = await Notification.create({
        userId: user.userId,
        title: template.title,
        message: template.message,
        type: "monthly",
      });

      io.to(user.userId.toString()).emit("notification", notification);
    }
  });
  // ---------------- LEADERBOARD SNAPSHOTS ----------------
agenda.define("daily-leaderboard", async () => {
  await generateLeaderboardSnapshot("daily");
});

agenda.define("weekly-leaderboard", async () => {
  await generateLeaderboardSnapshot("weekly");
});

agenda.define("monthly-leaderboard", async () => {
  await generateLeaderboardSnapshot("monthly");
});


  // START AGENDA
  await agenda.start();
await agenda.cancel({ name: {
  $in: [
    "send-daily-notifications",
    "send-weekly-notifications",
    "send-monthly-notifications",
    "daily-leaderboard",
    "weekly-leaderboard",
    "monthly-leaderboard",
  ]
}});

  // Run jobs at 9 AM
 // await agenda.every("0 9 * * *", "send-daily-notifications");
 await agenda.every("*/1 * * * *", "send-daily-notifications");
  await agenda.every("0 9 * * 1", "send-weekly-notifications");
  await agenda.every("0 9 1 * *", "send-monthly-notifications");

 
  // ---------------- LEADERBOARD SCHEDULE ----------------

// Daily leaderboard at 12:05 AM
await agenda.every("5 0 * * *", "daily-leaderboard");

// Weekly leaderboard (Sunday 12:10 AM)
await agenda.every("10 0 * * 0", "weekly-leaderboard");

// Monthly leaderboard (1st day 12:15 AM)
await agenda.every("15 0 1 * *", "monthly-leaderboard");
console.log("⏳ Agenda Jobs Scheduled (Notifications + Leaderboards)");

};

export default agenda;
