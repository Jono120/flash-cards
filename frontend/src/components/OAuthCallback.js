//// frontend/src/components/OAuthCallback.js
//import React, { useEffect } from "react";
//import { useNavigate, useLocation } from "react-router-dom";

//export default function OAuthCallback({ onLogin }) {
//  const navigate = useNavigate();
//  const location = useLocation();

//  useEffect(() => {
//    const params = new URLSearchParams(location.search);
//    const token = params.get("token"); // Backend can append token in redirect
//    if (token) {
//      localStorage.setItem("token", token);
//      onLogin({ id: 1, username: "Google User" }); // Replace with real profile info
//      navigate("/dashboard");
//    }
//  }, [location, navigate, onLogin]);

//  return <p>Authenticating...</p>;
//}
