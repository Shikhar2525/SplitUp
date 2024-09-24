import "./App.css";
import { Box, Container, CssBaseline } from "@mui/material";
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
        <Box
          sx={{
            flex: 1, // Makes Box grow to fill remaining height
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "auto", // Prevents content overflow with scrolling
          }}
        >
          <div
            style={{ height: "10px", backgroundColor: "red", width: "100%" }}
          ></div>
        </Box>
      </Container>
    </>
  );
}

export default App;
