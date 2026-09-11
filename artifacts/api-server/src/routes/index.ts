import { Router, type IRouter } from "express";
import healthRouter from "./health";
import assessmentRouter from "./assessment";
import evaluationRouter from "./evaluation";
import ragRouter from "./rag";
import referralRouter from "./referral";
import systemRouter from "./system";

const router: IRouter = Router();

router.use(healthRouter);
router.use(systemRouter);
router.use(assessmentRouter);
router.use(ragRouter);
router.use(referralRouter);
router.use(evaluationRouter);

export default router;
