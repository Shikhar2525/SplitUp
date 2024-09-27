import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ScreenSizeProvider } from "./components/contexts/ScreenSizeContext";
import { BrowserRouter } from "react-router-dom";
import { CurrentTabProvider } from "./components/contexts/CurrentTabContext";
import { ThemeProvider } from "@mui/material";
import theme from "./theme";
import { Auth0Provider } from "@auth0/auth0-react";
import { CurrentGroupProvider } from "./components/contexts/CurrentGroup";
import { CurrentUserProvider } from "./components/contexts/CurrentUser";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-n4n2az6w.us.auth0.com"
      clientId="pPfQpRGUOECwoaVhoxOlc3jFGXQ9u8wR"
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <ScreenSizeProvider>
        <CurrentTabProvider>
          <CurrentGroupProvider>
            <CurrentUserProvider>
              <BrowserRouter>
                <ThemeProvider theme={theme}>
                  <App />
                </ThemeProvider>
              </BrowserRouter>
            </CurrentUserProvider>
          </CurrentGroupProvider>
        </CurrentTabProvider>
      </ScreenSizeProvider>
    </Auth0Provider>
  </React.StrictMode>
);
