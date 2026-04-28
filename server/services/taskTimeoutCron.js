import cron from "node-cron";
import { processTimedOutAssignments } from "./taskTimeout.js";

export const startTimeoutCron = () => {
  console.log("Starting timeout cron job...");

  // runs every minute
  cron.schedule("* * * * *", async () => {
    console.log("Running timeout job...");
    await processTimedOutAssignments();
  });
};
