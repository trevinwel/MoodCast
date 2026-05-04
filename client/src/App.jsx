import { useState } from "react";
import Landing from "./components/Landing";
import Login from "./components/user/UserLogin";
import Register from "./components/user/UserRegister";
import UserApp from "./components/UserApp";

export default function App() {
  const [view, setView] = useState("landing");

  
  const handleGetStarted = () => setView("register");
  const handleSignIn = () => setView("userLogin");
  
  
  const handleLogin = () => setView("user"); 
  const handleRegister = () => setView("user"); 
  
  const handleLogout = () => { 
    
    localStorage.removeItem("username"); 
    setView("landing"); 
  };
  
  const handleBack = () => setView("landing");
  const handleSwitchToLogin = () => setView("userLogin");
  const handleSwitchToRegister = () => setView("register");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9f8fd", fontFamily: "sans-serif" }}>
      
      
      <main>
        {view === "landing" && (
          <Landing 
            onGetStarted={handleGetStarted} 
            onSignIn={handleSignIn}
          />
        )}
        
        {view === "register" && (
          <Register
            onRegister={handleRegister}
            onBack={handleBack}
            onSwitchToLogin={handleSwitchToLogin}
          />
        )}
        
        {view === "userLogin" && (
          <Login 
            onLogin={handleLogin} 
            onBack={handleBack}
            onSwitchToRegister={handleSwitchToRegister}
          />
        )}
        
        
        {view === "user" && <UserApp onLogout={handleLogout} />}
      </main>

    </div>
  );
}