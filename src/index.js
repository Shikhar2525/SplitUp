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
import { TopSnackBarProvider } from "./components/contexts/TopSnackBar";
import { LinerProgressProvider } from "./components/contexts/LinearProgress";
import { AllGroupsProvider } from "./components/contexts/AllGroups";
import { CircularLoaderProvider } from "./components/contexts/CircularLoader";
import { CurrentCurrencyrProvider } from "./components/contexts/CurrentCurrency";
import { RefetchLogsProvider } from "./components/contexts/RefetchLogs";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-n4n2az6w.us.auth0.com"
      clientId="pPfQpRGUOECwoaVhoxOlc3jFGXQ9u8wR"
      authorizationParams={{
        redirect_uri:
          window.location.origin +
          window.location.pathname +
          window.location.search,
      }}
    >
      <ScreenSizeProvider>
        <CurrentTabProvider>
          <CurrentGroupProvider>
            <CurrentUserProvider>
              <CurrentCurrencyrProvider>
                <TopSnackBarProvider>
                  <CircularLoaderProvider>
                    <LinerProgressProvider>
                      <AllGroupsProvider>
                        <RefetchLogsProvider>
                          <BrowserRouter>
                            <ThemeProvider theme={theme}>
                              <App />
                            </ThemeProvider>
                          </BrowserRouter>
                        </RefetchLogsProvider>
                      </AllGroupsProvider>
                    </LinerProgressProvider>
                  </CircularLoaderProvider>
                </TopSnackBarProvider>
              </CurrentCurrencyrProvider>
            </CurrentUserProvider>
          </CurrentGroupProvider>
        </CurrentTabProvider>
      </ScreenSizeProvider>
    </Auth0Provider>
  </React.StrictMode>
);
