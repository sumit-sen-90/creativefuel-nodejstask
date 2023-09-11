const { Validator } = require("node-input-validator");
const response = require("../config/response");
const helper = require("../helper/hlp_common");
const users = require("../model/users");
const constant = require("../common/constant");
const jwt = require("jsonwebtoken");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

//------------------------------------------USER REGISTRAION
exports.signup = async (req, res) => {
  const postData = req.body;
  postData.profile_img = req.file?.filename;
  try {
    //Validate the request body data
    let validation = new Validator(postData, {
      name: "required|alpha",
      surname: "required|alpha",
      email: "required|email",
      password: "required|string|minLength:6",
    });
    let matched = await validation.check();
    if (!matched) {
      return response.returnFalse(
        req,
        res,
        helper.validationErrorConvertor(validation),
        {}
      );
    }

    //Check if email is already exists or not
    const userData = await users.findOne({ email: postData.email });
    if (userData) {
      return response.returnFalse(req, res, constant.EMAIL_ALREADY_EXISTS, {});
    }

    postData.password = await helper.encryptPassword(postData.password);
    const userInfo = new users(postData);
    const savedUser = await userInfo.save();
    if (savedUser) {
      return response.returnTrue(
        req,
        res,
        constant.REGISTRATION_SUCCESS,
        savedUser
      );
    } else {
      return response.returnFalse(req, res, constant.OOPS_TRY_AGAIN, {});
    }
  } catch (error) {
    console.error("Error signup:", error);
    return response.returnFalse(req, res, constant.INTERNAL_ERROR, {});
  }
};

//------------------------------------------USER LOGIN

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    let validation = new Validator(req.body, {
      email: "required|email",
      password: "required",
    });
    let matched = await validation.check();
    if (!matched) {
      return response.returnFalse(
        req,
        res,
        helper.validationErrorConvertor(validation),
        {}
      );
    }
    const userData = await users.findOne({ email });
    if (userData) {
      if (helper.comparePassword(password, userData.password)) {
        //Token creation
        const jwtToken = jwt.sign(
          {
            id: userData._id,
          },
          process.env.JWT_SECRET_KEY,
          { expiresIn: process.env.JWT_EXPIRE }
        );
        return response.returnTrue(req, res, constant.LOGIN_SUCCESS, {
          token: jwtToken,
        });
      } else {
        return response.returnFalse(req, res, constant.PASSWORD_WRONG, {});
      }
    } else {
      return response.returnFalse(req, res, constant.LOGIN_FAIL, {});
    }
  } catch (error) {
    console.error("Error login:", error);
    return response.returnFalse(req, res, constant.INTERNAL_ERROR, {});
  }
};

//------------------------------------------USERs EXCELSHEET CREATION

exports.createExcelSheet = async (req, res) => {
  try {
    const userData = await users.find();

    // Create a new Excel workbook and worksheet.
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("User Details");

    // Define the columns in the Excel sheet.
    worksheet.columns = [
      { header: "Name", key: "name", width: 20 },
      { header: "Surname", key: "surname", width: 30 },
      { header: "Profile Image", key: "profile_img", width: 30 },
    ];

    // Add user details to the worksheet.
    userData.forEach((user) => {
      worksheet.addRow(user);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const excelBase64 = buffer.toString("base64");

    // Save the workbook to a file on the server if needed this is only for see how data is stored or not properly instead of this i send the excel data in the response and the frontend developer encode this res data and use as they needed
    workbook.xlsx
      .writeFile(`uploads/excelsheet/users${Date.now()}.xlsx`)
      .then(() => {
        console.log("Excel sheet generated successfully!");
      })
      .catch((error) => {
        console.error("Error generating Excel sheet:", error);
      });
    //

    return response.returnTrue(req, res, constant.EXCEL_DATA_SUCCESS, {
      excelBase64,
    });
  } catch (error) {
    console.error("Error Excel data:", error);
    return response.returnFalse(req, res, constant.INTERNAL_ERROR, {});
  }
};

//------------------------------------------USER PDF CREATION 

exports.createPdf = async (req, res) => {
  try {
    const userId = helper.loginUserId(req.headers.authorization);
    const userData = await users.findById(userId);
    if (!userData) {
      return response.returnFalse(req, res, constant.USER_NOT_FOUND, {});
    }

    // Create a PDF document
    const doc = new PDFDocument();
    const pdfChunks = [];
    doc.on("data", (chunk) => pdfChunks.push(chunk));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(pdfChunks);
      const pdfBase64 = pdfBuffer.toString("base64");
      return response.returnTrue(req, res, constant.PDF_SEND_SUCCESS, {
        userData,
        pdfBase64,
      });
    });

    // Add content to the PDF
    doc.fontSize(16).text("User Details", { align: "center" });
    doc.fontSize(12).text(`Name: ${userData.name}`);
    doc.fontSize(12).text(`Email: ${userData.email}`);
    doc.end();
  } catch (error) {
    console.error("Error pdf data:", error);
    return response.returnFalse(req, res, constant.INTERNAL_ERROR, {});
  }
};
