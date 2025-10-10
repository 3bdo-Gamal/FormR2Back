import express from "express";
import { google } from "googleapis";
import bodyParser from "body-parser";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(cors());
app.use(bodyParser.json());


const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });


const SPREADSHEET_ID = "اكتب هنا ID الشيت بتاعك";

// 🟢 نقطة استقبال البيانات من الفورم
app.post("/submit", async (req, res) => {
  try {
    const data = req.body;

    const row = [
      data.name,
      data.age,
      data.nationalId,
      data.phone,
      data.whatsapp,
      data.email,
      data.gender,
      data.governorate,
      data.address,
      data.studentStatus,
      data.university,
      data.faculty,
      data.graduationYear,
      data.phase1,
      data.solidarity,
      data.specialNeeds,
      data.Takafol,
      data.hasLaptop,
      data.training,
      data.knowledge_about_field,
      data.reason_for_choice,
      data.expectations_from_field,
      data.cv || "",
      data.idCard,
      data.photo,
      new Date().toLocaleString(),
    ];

    
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A:Z",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });

    res.json({ status: "success", message: "تم حفظ البيانات بنجاح ✅" });
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ✅ تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
