import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from '../login/login';
import LogoutButton from '../login/logout';

const Profile = () => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const getUserMetadata = async () => {
      try {
        if (!user) {
          console.log("User not loaded yet");
          return;
        }
        const accessToken = await getAccessTokenSilently();
        console.log("Got access token");
       
        const userDetailsByIdUrl = `https://dev-c7t4suh18tfmv2xh.us.auth0.com/api/v2/users/${user.sub}`;
        console.log("Fetching from URL:", userDetailsByIdUrl);
       
        const metadataResponse = await fetch(userDetailsByIdUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const userData = await metadataResponse.json();
        console.log("Full user data:", userData);
      } catch (e) {
        console.log("Error in getUserMetadata:", e);
      }
    };
    
    if (isAuthenticated && user) {
      getUserMetadata();
    }
  }, [getAccessTokenSilently, user, isAuthenticated]);
  
  return (
    <div className="profile-container mx-4 flex flex-1 justify-end">
      {!isAuthenticated && <LoginButton />}
     
      {isAuthenticated && (
        <div className="profile-info flex flex-row items-center text-white">
          <text className="text-sm mx-3">Hello, {user?.name}</text>
          <LogoutButton />
        </div>
      )}
    </div>
  );
};

export default Profile;