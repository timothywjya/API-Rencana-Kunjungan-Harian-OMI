import express from "express";
import logController from "../controller/log-controller.js";
import timetableController from "../controller/timetable-controller.js";
import userController from "../controller/user-controller.js";

const privateRouter = new express.Router();

// privateRouter.use(authMiddleware);
// privateRouter.use(errorMiddleware);

privateRouter.get("/api/user-info", userController.userInfo);
privateRouter.post("/api/reset-password", userController.resetPassword);
privateRouter.post("/api/apps-log", logController.insertDataLogApps);

privateRouter.post(
    "/api/change-visit-date",
    timetableController.changeVisitDate
);
privateRouter.get("/api/timetable", timetableController.getTimetable);
privateRouter.put("/api/timetable", timetableController.uploadTimetable);
privateRouter.put(
    "/api/timetable-question",
    timetableController.uploadTimetableQuestion
);
privateRouter.post("/api/timetable-images", timetableController.uploadImage);
privateRouter.post("/api/sales", timetableController.insertSales);
privateRouter.get(
    "/api/timetable/history",
    timetableController.getTimetableHistory
);

export { privateRouter };
