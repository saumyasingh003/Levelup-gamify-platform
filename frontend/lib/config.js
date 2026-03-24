export const API_URL = 
  typeof window !== "undefined" && window.location.hostname !== "localhost" 
    ? "/api" 
    : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000");
