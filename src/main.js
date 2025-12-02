import dotenv from 'dotenv';
import "dotenv/config";
import { logger } from "./application/logging.js";
import { web } from "./application/web.js";

dotenv.config();

web.listen(process.env.PORT, () => {
    logger.info("App Start localhost:" + process.env.PORT);
});