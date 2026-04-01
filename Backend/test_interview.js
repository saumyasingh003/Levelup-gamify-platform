import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: 'Backend/.env' });

const testInterview = async () => {
    try {
        const response = await axios.post('http://localhost:5000/ai/interview', {
            career: "Software Development",
            history: []
        }, {
            // Mocking auth if needed or just checking endpoint exists
        });
        console.log("Success:", response.data);
    } catch (err) {
        console.log("Status:", err.response?.status);
        console.log("Error Data:", err.response?.data);
    }
}

testInterview();
