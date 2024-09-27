import { Container, CssBaseline } from "@mui/material";
import MainContainer from "./components/MainContainer/MainContainer";
import { useLocation } from "react-router";
import { useEffect } from "react";
import { useCurrentTab } from "./components/contexts/CurrentTabContext";
import userService from "./components/services/user.service";
import { useAuth0 } from "@auth0/auth0-react";
import { v4 as uuidv4 } from "uuid";
import { useCurrentUser } from "./components/contexts/CurrentUser";

function App() {
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useAuth0();
  const { setCurrentTab } = useCurrentTab();
  let currentPath = window.location.pathname.replace(/^\/+/, "");
  currentPath = currentPath ? currentPath : "home";
  const { setCurrentUser } = useCurrentUser();

  // Create user in db
  const createUser = async () => {
    await userService.addUniqueUser({
      id: uuidv4(),
      firstName: user.given_name,
      lastName: user.family_name,
      joinedDate: new Date(),
      profilePicture: user.picture,
      email: user.email,
      groups: [],
    });
  };

  const fetchUser = async () => {
    const currentUser = await userService.getUserByEmail(user.email);
    setCurrentUser(currentUser);
  };

  useEffect(() => {
    if (user && isAuthenticated && !isLoading) {
      createUser();
      fetchUser();
    }
  }, [user, isAuthenticated, isLoading]);

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
