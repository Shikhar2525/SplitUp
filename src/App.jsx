import { Container, CssBaseline } from "@mui/material";
import MainContainer from "./components/MainContainer/MainContainer";
import { useLocation } from "react-router";
import { useEffect } from "react";
import { useCurrentTab } from "./components/contexts/CurrentTabContext";
function App() {
  const location = useLocation();
  const { setCurrentTab } = useCurrentTab();
  let currentPath = window.location.pathname.replace(/^\/+/, "");
  currentPath = currentPath ? currentPath : "home";
  useEffect(() => {
    setCurrentTab(currentPath.charAt(0).toUpperCase() + currentPath.slice(1));
  }, [location]);

  return (
    <>
      <CssBaseline />
      <Container
        maxWidth="lg"
        sx={{
          height: "100vh",
          padding: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <MainContainer />
      </Container>
    </>
  );
}

export default App;
