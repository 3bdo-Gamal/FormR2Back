import express from "express";
import { google } from "googleapis";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Load credentials safely
let credentials = null;
if (process.env.GOOGLE_CREDENTIALS) {
  try {
    credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  } catch (err) {
    console.error("❌ Failed to parse GOOGLE_CREDENTIALS:", err.message);
  }
}

// ✅ Initialize Google Auth
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;


app.post("/check-nationalId", async (req, res) => {
  try {
    const { nationalId } = req.body;
    if (!nationalId) return res.status(400).json({ status: "error", message: "الرقم القومي مطلوب." });

    const readResp = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Student_Data!C:C", // نفترض الرقم القومي في العمود C
    });

    const values = readResp.data.values || [];
    const existingIds = values.map(r => (r[0] || "").trim()).filter(v => v);

    if (existingIds.includes(nationalId.trim())) {
      return res.status(409).json({ status: "error", message: "الرقم القومي مسجل بالفعل." });
    }

    return res.json({ status: "success", message: "الرقم القومي متاح." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: "حدث خطأ في السيرفر" });
  }
});


app.post("/submit", async (req, res) => {
  try {
    const data = req.body;
    const nationalId = (data.nationalId || "").trim();

    if (!nationalId) {
      return res.status(400).json({ status: "error", message: "الرقم القومي مطلوب." });
    }

    // أقرأ العمود للتأكد مرة ثانية (حماية إضافية)
    const readResp = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Student_Data!C:C",
    });
    const values = readResp.data.values || [];
    const existingIds = values.map(r => (r[0] || "").trim()).filter(v => v);

    if (existingIds.includes(nationalId)) {
      return res.status(409).json({ status: "error", message: "الرقم القومي مسجل بالفعل." });
    }

    // لو مش موجود، أضف الصف
    const row = [
      data.name,
      data.age,
      nationalId,
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
      range: "Student_Data",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });

    return res.json({ status: "success", message: "تم حفظ البيانات بنجاح ✅" });

  } catch (err) {
    console.error("❌ Error:", err);
    return res.status(500).json({ status: "error", message: err.message || "حدث خطأ في السيرفر" });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
