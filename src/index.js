import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ScreenSizeProvider } from "./components/contexts/ScreenSizeContext";
import { BrowserRouter } from "react-router-dom";
import { CurrentTabProvider } from "./components/contexts/CurrentTabContext";
import { ThemeProvider } from "@mui/material";
import theme from "./theme";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ScreenSizeProvider>
      <CurrentTabProvider>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <App />
          </ThemeProvider>
        </BrowserRouter>
      </CurrentTabProvider>
    </ScreenSizeProvider>
  </React.StrictMode>
);
