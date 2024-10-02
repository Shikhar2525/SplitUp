import { Container, CssBaseline } from "@mui/material";
import MainContainer from "./components/MainContainer/MainContainer";
import { useLocation } from "react-router";
import { useEffect, useState } from "react";
import { useCurrentTab } from "./components/contexts/CurrentTabContext";
import userService from "./components/services/user.service";
import { useAuth0 } from "@auth0/auth0-react";
import { v4 as uuidv4 } from "uuid";
import { useCurrentUser } from "./components/contexts/CurrentUser";
import AddNameModal from "./components/AddNameModal/AddNameModal"; // Modal component for name input

function App() {
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useAuth0();
  const { setCurrentTab } = useCurrentTab();
  const { setCurrentUser } = useCurrentUser();
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  let currentPath = window.location.pathname.replace(/^\/+/, "");
  currentPath = currentPath ? currentPath : "home";

  // Utility function to check if the name is an email
  const isEmail = (name) => {
    const emailRegex = /\S+@\S+\.\S+/;
    return emailRegex.test(name);
  };

  // Create user in db
  const createUser = async (name) => {
    console.log(`Creating user with name: ${name}`);
    await userService.addUniqueUser({
      id: uuidv4(),
      name: name,
      joinedDate: new Date(),
      profilePicture: user.picture,
      email: user.email,
      hasEnteredName: true, // Track name entry
    });
  };

  const fetchUser = async () => {
    console.log(`Fetching user by email: ${user.email}`);
    const currentUser = await userService.getUserByEmail(user.email);
    if (currentUser) {
      setCurrentUser(currentUser);
    }
    return currentUser;
  };

  useEffect(() => {
    const checkUserEntryStatus = async () => {
      if (user && isAuthenticated && !isLoading) {
        console.log("User is authenticated, checking entry status...");
        const currentUser = await fetchUser(); // Fetch user by email

        // If the user exists, check if they have already entered their name
        if (currentUser) {
          if (currentUser.hasEnteredName) {
            console.log("User has already entered their name.");
            return; // User has already entered their name, no action needed
          }

          // If user name is an email and they haven't entered their name yet, open the modal
          if (isEmail(user.name)) {
            console.log("User name is an email, opening modal...");
            setIsNameModalOpen(true);
          } else {
            console.log("Creating user with valid name...");
            await createUser(user.name); // Create user if name is valid
          }
        } else {
          // If user is not found, check if the name is an email
          if (isEmail(user.name)) {
            console.log(
              "No user found in the database and name is an email, opening modal..."
            );
            setIsNameModalOpen(true); // Open modal if user is not found
          } else {
            console.log("Creating user with valid name...");
            await createUser(user.name); // Create user if name is valid
          }
        }
      }
    };

    checkUserEntryStatus();
  }, [user, isAuthenticated, isLoading]);

  // Handle the modal submit to create user with new name
  const handleNameSubmit = async (name) => {
    console.log(`Modal submitted with name: ${name}`);
    await createUser(name); // Create user with the new name
    await fetchUser(); // Fetch the user after creation
    setIsNameModalOpen(false); // Close the modal
  };

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

      {/* Modal for entering the correct name */}
      <AddNameModal
        open={isNameModalOpen}
        onClose={() => setIsNameModalOpen(false)}
        onSubmit={handleNameSubmit}
      />
    </>
  );
}

export default App;
