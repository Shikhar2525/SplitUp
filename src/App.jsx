import { Container, CssBaseline } from "@mui/material";
import MainContainer from "./components/MainContainer/MainContainer";
function App() {
  return (
    <>
      <CssBaseline />
      <Container
        maxWidth="lg"
        sx={{
          padding: 2,
          height: "100vh", // Make the container take up full viewport height
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
