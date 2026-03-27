import { Router } from "express";
import { siteContent } from "../content/site-content";
import {
  getStoredSiteContent,
  getStoredSiteContentPage,
  updateStoredSiteContentPage,
} from "../content/site-content-store";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", async (_req, res) => {
  res.json(await getStoredSiteContent());
});

router.get("/:page", async (req, res) => {
  const page = req.params.page as keyof typeof siteContent;
  const payload = await getStoredSiteContentPage(page);

  if (!payload) {
    return res.status(404).json({ error: "Content not found" });
  }

  return res.json(payload);
});

router.put("/:page", requireAuth, async (req, res) => {
  const page = req.params.page as keyof typeof siteContent;

  if (!(page in siteContent)) {
    return res.status(404).json({ error: "Content not found" });
  }

  const payload = await updateStoredSiteContentPage(page, req.body);
  return res.json(payload);
});

export default router;
