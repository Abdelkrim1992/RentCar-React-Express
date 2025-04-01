import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Fonts } from "@/components/ui/fonts";

createRoot(document.getElementById("root")!).render(
  <>
    <Fonts />
    <App />
  </>
);
