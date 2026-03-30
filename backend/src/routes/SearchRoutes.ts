import { Router } from "express";
import { SearchController } from "../controllers/SearchController";

const router = Router();
const searchController = new SearchController();

router.get("/suggestions", (req, res) => searchController.getSuggestions(req, res));

export { router as searchRoutes };
