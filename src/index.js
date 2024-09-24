import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ScreenSizeProvider } from "./components/contexts/ScreenSizeContext";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ScreenSizeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ScreenSizeProvider>
  </React.StrictMode>
);
