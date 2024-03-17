/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;

const transporter = nodemailer.createTransport({
  service: "gmail", // Example using Gmail
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

exports.sendAssignmentNotification = functions.firestore
    .document("assignments/{assignmentId}")
    .onCreate(async (snap, context) => {
      const assignmentData = snap.data();
      const classIds = assignmentData.classes;

      // Fetch emails of all students registered in the classes
      let emailList = [];

      for (const classId of classIds) {
        const timetableSnapshot = await admin
            .firestore()
            .collection("timetable")
            .doc(classId)
            .get();

        if (timetableSnapshot.exists) {
          const studRegister = timetableSnapshot.data().studRegister;

          for (const studentId of studRegister) {
            const studentSnapshot = await admin
                .firestore()
                .collection("student")
                .where("studentID", "==", studentId)
                .get();

            if (!studentSnapshot.empty) {
              const studentData = studentSnapshot.docs[0].data();
              emailList.push(studentData.emailAddress);
            }
          }
        }
      }

      // Removing duplicate emails if any
      emailList = [...new Set(emailList)];

      // Sending email to all collected student emails
      const mailOptions = {
        from: "your-email@gmail.com", // Replace with your actual email
        to: emailList,
        subject: `New Assignment: ${assignmentData.title}`,
        text: `${assignmentData.description}`,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log("Emails sent successfully");
      } catch (error) {
        console.error("Error sending emails:", error);
      }
    });
