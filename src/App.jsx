  // FIXED: Force popup on all devices to bypass mobile cross-domain tracking blocks
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Logged in successfully:", result.user);
    } catch (error) {
      console.error("Login Error:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        console.log("User closed the login window.");
      }
    }
  };