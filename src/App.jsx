import { Container, CssBaseline } from "@mui/material";
import MainContainer from "./components/MainContainer/MainContainer";
function App() {
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
