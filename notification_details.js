// Initialize Firebase (use your own Firebase config)
const firebaseConfig = {
  apiKey: "AIzaSyBtSdg0XwU3cePNEn-HVlof8vj_imx0guA",
  authDomain: "utarapp-9f3db.firebaseapp.com",
  projectId: "utarapp-9f3db",
  storageBucket: "utarapp-9f3db.appspot.com",
  messagingSenderId: "331019317153",
  appId: "1:331019317153:web:79d3d098d6d5c3759da5e0",
};
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const notificationDetailsContainer = document.getElementById(
  "notificationDetails"
);
let notificationId = "";

// Get the notification ID from the URL query parameter
function getNotificationId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

// Fetch notification details from Firestore
function fetchNotificationDetails(notificationId) {
  db.collection("notification")
    .doc(notificationId)
    .get()
    .then((doc) => {
      if (doc.exists) {
        const notificationData = doc.data();
        displayNotificationDetails(notificationData);
      } else {
        console.error("Notification not found");
      }
    })
    .catch((error) => {
      console.error("Error fetching notification details: ", error);
    });
}

// Display notification details
function displayNotificationDetails(notificationData) {
  notificationDetailsContainer.innerHTML = `
      <h3>${notificationData.title}</h3>
      <p><strong>Date:</strong> ${notificationData.date}</p>
      <p><strong>Description:</strong> ${notificationData.description}</p>
    `;
}

// Edit notification
function editNotification() {
  const editTitle = document.getElementById("editTitle");
  const editDescription = document.getElementById("editDescription");
  const editCurrentDate = document.getElementById("editCurrentDate");

  db.collection("notification")
    .doc(notificationId)
    .get()
    .then((doc) => {
      if (doc.exists) {
        const notificationData = doc.data();
        editTitle.value = notificationData.title;
        editDescription.value = notificationData.description;
        editCurrentDate.value = notificationData.date;
        $("#editNotificationModal").modal("show");
      } else {
        console.error("Notification not found");
      }
    })
    .catch((error) => {
      console.error("Error fetching notification details: ", error);
    });
}

// Update notification
function updateNotification() {
  const editedTitle = document.getElementById("editTitle").value;
  const editedDescription = document.getElementById("editDescription").value;
  const editedDate = document.getElementById("editCurrentDate").value;

  db.collection("notification")
    .doc(notificationId)
    .update({
      title: editedTitle,
      description: editedDescription,
      date: editedDate,
    })
    .then(() => {
      $("#editNotificationModal").modal("hide");
      fetchNotificationDetails(notificationId);
    })
    .catch((error) => {
      console.error("Error updating notification: ", error);
    });
}

// Delete notification
function deleteNotification() {
  $("#deleteNotificationModal").modal("show");
}

// Confirm delete notification
function confirmDelete() {
  db.collection("notification")
    .doc(notificationId)
    .delete()
    .then(() => {
      $("#deleteNotificationModal").modal("hide");
      window.location.href = "notification_list.html";
    })
    .catch((error) => {
      console.error("Error deleting notification: ", error);
    });
}

// Get the notification ID and fetch details on page load
notificationId = getNotificationId();
fetchNotificationDetails(notificationId);
