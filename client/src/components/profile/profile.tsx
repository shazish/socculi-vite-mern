import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from '../login/login';
import LogoutButton from '../login/logout';

const Profile = () => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [userMetadata, setUserMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUserMetadata = async () => {
      try {
        console.log("Current user:", user); // Debug log
        console.log("Is authenticated:", isAuthenticated); // Debug log

        if (!user) {
          console.log("User not loaded yet");
          return;
        }

        const accessToken = await getAccessTokenSilently();
        console.log("Got access token"); // Debug log
        
        const userDetailsByIdUrl = `https://dev-c7t4suh18tfmv2xh.us.auth0.com/api/v2/users/${user.sub}`;
        console.log("Fetching from URL:", userDetailsByIdUrl); // Debug log
        
        const metadataResponse = await fetch(userDetailsByIdUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const userData = await metadataResponse.json();
        console.log("Full user data:", userData);

        const { user_metadata } = userData;
        setUserMetadata(user_metadata);
      } catch (e) {
        console.log("Error in getUserMetadata:", e);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user) {
      getUserMetadata();
    }
  }, [getAccessTokenSilently, user, isAuthenticated]);


  // if (isLoading || !user) {
  //   return (
  //     <div className="profile-container">
  //       <span>Loading user profile...</span>
  //     </div>
  //   );
  // }

  return (
    <div className="profile-container mx-4 flex flex-1 justify-end">
      {!isAuthenticated && <LoginButton />}
      
      {isAuthenticated && (
        <div className="profile-info flex flex-row items-center text-white text-sm mx-3">
          
          <h2>Hello, {user.name}</h2>
          {/* <img src={user.picture} alt={user.name} /> */}
          {/* <p>{user.email}</p> */}
        </div>
      )}
      <LogoutButton />
    </div>
  );
};

export default Profile;