import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

async function testUpload() {
  const minimalPdf = Buffer.from(
    "%PDF-1.1\n%\\xFF\\xFF\\xFF\\xFF\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Count 1\n/Kids [ 3 0 R ]\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/Resources <<\n/Font <<\n/F1 4 0 R\n>>\n>>\n/Contents 5 0 R\n>>\nendobj\n4 0 obj\n<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\nendobj\n5 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 24 Tf\n100 100 Td\n(Hello World) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000018 00000 n \n0000000077 00000 n \n0000000146 00000 n \n0000000259 00000 n \n0000000350 00000 n \ntrailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n444\n%%EOF\n"
  );
  
  const form = new FormData();
  form.append('file', minimalPdf, {
    filename: 'test.pdf',
    contentType: 'application/pdf',
  });

  try {
    const res = await axios.post('http://localhost:5000/resume/upload', form, {
      headers: form.getHeaders(),
      // Add a dummy cookie or token if it's protected. If it is protected, it requires a JWT token.
    });
    console.log(res.status, res.data);
  } catch (err) {
    if (err.response) {
      console.error('Fetch Error:', err.response.status, err.response.data);
    } else {
      console.error('Fetch Error:', err.message);
    }
  }
}

testUpload();
