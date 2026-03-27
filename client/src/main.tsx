import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
if (import.meta.env.VITE_ANALYTICS_ENDPOINT && import.meta.env.VITE_ANALYTICS_WEBSITE_ID) {
  const script = document.createElement("script");
  script.src = `${import.meta.env.VITE_ANALYTICS_ENDPOINT}/umami`;
  script.setAttribute("data-website-id", import.meta.env.VITE_ANALYTICS_WEBSITE_ID);
  script.defer = true;
  document.body.appendChild(script);
}