import { Router } from "express";
import { siteContent, type SiteContentPage } from "../content/site-content";
import {
  getStoredSiteContent,
  getStoredSiteContentPage,
  isSiteContentPage,
  updateStoredSiteContentPage,
} from "../content/site-content-store";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", async (_req, res) => {
  res.json(await getStoredSiteContent());
});

router.get("/:page", async (req, res) => {
  const page = req.params.page;

  if (!isSiteContentPage(page)) {
    return res.status(404).json({ error: "Content not found" });
  }

  const payload = await getStoredSiteContentPage(page as SiteContentPage);

  if (!payload) {
    return res.status(404).json({ error: "Content not found" });
  }

  return res.json(payload);
});

router.put("/:page", requireAuth, async (req, res) => {
  const page = req.params.page;

  if (!isSiteContentPage(page)) {
    return res.status(404).json({ error: "Content not found" });
  }

  const payload = await updateStoredSiteContentPage(page as SiteContentPage, req.body);
  return res.json(payload);
});

export default router;