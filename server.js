import express from "express";
import { google } from "googleapis";
import bodyParser from "body-parser";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ملف JSON اللي نزلته من Google Cloud
const credentials = JSON.parse(fs.readFileSync("credentials.json"));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});

const sheets = google.sheets({ version: "v4", auth });

const SPREADSHEET_ID = "اكتب هنا ID الشيت بتاعك";

app.post("/submit", async (req, res) => {
  try {
    const data = req.body;

    const row = [
      data.name,
      data.email,
      data.phone,
      data.training,
      data.photo,
      new Date().toLocaleString()
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A:Z",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] }
    });

    res.json({ status: "success", message: "تم الحفظ بنجاح ✅" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.listen(3000, () => console.log("✅ Server running on port 3000"));
