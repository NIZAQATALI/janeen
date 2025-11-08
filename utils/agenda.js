import Agenda from "agenda";
import NotificationTemplate from "../models/Notificationtemplate.js";
import NotificationPreference from "../models/Notificationprefrence.js";
import Notification from "../models/Notification.js";
import mongoose from "mongoose";

let agenda;

export const startAgenda = async (io) => {
  agenda = new Agenda({
    db: { address: process.env.MONGODB_URL, collection: "agendaJobs" },
  });

  // ----- DAILY JOB -----
  agenda.define("send-daily-notifications", async () => {
    const template = await NotificationTemplate.findOne({ type: "daily" });
    if (!template) return;

    const users = await NotificationPreference.find({ frequency: "daily" });

    for (const user of users) {
      const notification = await Notification.create({
        userId: user.userId,
        title: template.title,
        message: template.message,
        type: "daily",
      });

      io.to(user.userId.toString()).emit("notification", notification);
    }
  });

  // ----- WEEKLY JOB -----
  agenda.define("send-weekly-notifications", async () => {
    const template = await NotificationTemplate.findOne({ type: "weekly" });
    if (!template) return;

    const users = await NotificationPreference.find({ frequency: "weekly" });

    for (const user of users) {
      const notification = await Notification.create({
        userId: user.userId,
        title: template.title,
        message: template.message,
        type: "weekly",
      });

      io.to(user.userId.toString()).emit("notification", notification);
    }
  });

  // ----- MONTHLY JOB -----
  agenda.define("send-monthly-notifications", async () => {
    const template = await NotificationTemplate.findOne({ type: "monthly" });
    if (!template) return;

    const users = await NotificationPreference.find({ frequency: "monthly" });

    for (const user of users) {
      const notification = await Notification.create({
        userId: user.userId,
        title: template.title,
        message: template.message,
        type: "monthly",
      });

      io.to(user.userId.toString()).emit("notification", notification);
    }
  });

  await agenda.start();

  // RUN SCHEDULES (all at 9:00 AM)
  await agenda.every("0 9 * * *", "send-daily-notifications");     // daily at 9am
  await agenda.every("0 9 * * 1", "send-weekly-notifications");     // every Monday 9am
  await agenda.every("0 9 1 * *", "send-monthly-notifications");    // 1st of every month 9am

  console.log("⏳ Agenda Jobs Scheduled at 9:00 AM Daily/Weekly/Monthly");
};

export default agenda;
