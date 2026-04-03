import fetch from "node-fetch";

async function testFetch() {
  try {
    const res = await fetch("http://localhost:5000/ai/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ career: "Software Engineer", resume: "My resume", history: [] })
    });
    const data = await res.text();
    console.log("Status:", res.status);
    console.log("Body:", data);
  } catch (e) {
    console.error("Connection failed:", e.message);
  }
}

testFetch();
