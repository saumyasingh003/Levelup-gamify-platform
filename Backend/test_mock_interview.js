import { mockInterview } from "./src/controllers/ai.js";
import connectDB from "./src/config/db.js";

async function run() {
  await connectDB();
  const req = {
    body: {
      career: "Software Engineer",
      resume: "My resume",
      history: []
    },
    user: { _id: "test" }
  };
  const res = {
    status: (code) => {
      console.log("STATUS:", code);
      return res;
    },
    json: (data) => {
      console.log("JSON:", JSON.stringify(data, null, 2));
    }
  };
  await mockInterview(req, res);
  process.exit();
}

run();
