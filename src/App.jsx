import { Container, CssBaseline } from "@mui/material";
import MainContainer from "./components/MainContainer/MainContainer";
import { FriendsProvider } from "./components/contexts/FriendsContext";
import { useLocation } from "react-router";
import { useEffect, useState } from "react";
import { useCurrentTab } from "./components/contexts/CurrentTabContext";
import userService from "./components/services/user.service";
import { useAuth0 } from "@auth0/auth0-react";
import { v4 as uuidv4 } from "uuid";
import { useCurrentUser } from "./components/contexts/CurrentUser";
import AddNameModal from "./components/AddNameModal/AddNameModal"; // Modal component for name input

function App() {
  const { currentUser } = useCurrentUser();
  const { isAuthenticated, user, isLoading } = useAuth0();
  // Store userEmail in localStorage as soon as available
  useEffect(() => {
    if (isAuthenticated && user && user.email) {
      localStorage.setItem("userEmail", user.email);
    }
  }, [isAuthenticated, user]);
  const location = useLocation();
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
    const currentUser = await userService.getUserByEmail(user.email);
    return currentUser; // Return currentUser for further checks
  };

  useEffect(() => {
    const checkUserEntryStatus = async () => {
      if (user && isAuthenticated && !isLoading) {
        const currentUser = await fetchUser(); // Fetch user by email

        // If the user exists, check if they have already entered their name
        if (currentUser) {
          setCurrentUser(currentUser); // Set currentUser if it exists
          if (currentUser.hasEnteredName) {
            return; // User has already entered their name, no action needed
          }

          // If user name is an email and they haven't entered their name yet, open the modal
          if (isEmail(user.name)) {
            setIsNameModalOpen(true);
          } else {
            await createUser(user.name); // Create user if name is valid
          }
        } else {
          // If user is not found, check if the name is an email
          if (isEmail(user.name)) {
            setIsNameModalOpen(true); // Open modal if user is not found
          } else {
            await createUser(user.name); // Create user if name is valid
          }
        }
      }
    };

    checkUserEntryStatus();
  }, [user, isAuthenticated, isLoading]);

  useEffect(() => {
    user &&
      setCurrentUser({
        id: uuidv4(),
        name: user?.name,
        joinedDate: new Date(),
        profilePicture: user?.picture,
        email: user.email,
        hasEnteredName: true, // Track name entry
      });
  }, [user]);

  // Handle the modal submit to create user with new name
  const handleNameSubmit = async (name) => {
    await createUser(name); // Create user with the new name
    const currentUser = await fetchUser(); // Fetch the user after creation
    if (currentUser) {
      setCurrentUser(currentUser); // Set the current user if found
    }
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
        <FriendsProvider userEmail={currentUser?.email}>
  <MainContainer />
</FriendsProvider>
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
