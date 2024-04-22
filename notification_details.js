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
const storage = firebase.storage();
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
      ${
        notificationData.photoURLs && notificationData.photoURLs.length > 0
          ? `<div>
               <strong>Photos:</strong>
               ${notificationData.photoURLs
                 .map(
                   (url) =>
                     `<img src="${url}" class="notification-image" alt="Notification Photo">`
                 )
                 .join("")}
             </div>`
          : ""
      }
      ${
        notificationData.fileURLs && notificationData.fileURLs.length > 0
          ? `<div>
               <strong>Files:</strong>
               ${notificationData.fileURLs
                 .map(
                   (url) =>
                     `<div class="notification-file"><a href="${url}" target="_blank">${url}</a></div>`
                 )
                 .join("")}
             </div>`
          : ""
      }
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
  const editedPhotoUploads = document.getElementById("editPhotoUpload").files;
  const editedFileUploads = document.getElementById("editFileUpload").files;

  const updateData = {
    title: editedTitle,
    description: editedDescription,
    date: editedDate,
  };

  // Delete previous photos and files
  db.collection("notification")
    .doc(notificationId)
    .get()
    .then((doc) => {
      const notificationData = doc.data();
      const deletePromises = [];

      if (notificationData.photoURLs && notificationData.photoURLs.length > 0) {
        notificationData.photoURLs.forEach((url) => {
          const deletePromise = storage.refFromURL(url).delete();
          deletePromises.push(deletePromise);
        });
      }

      if (notificationData.fileURLs && notificationData.fileURLs.length > 0) {
        notificationData.fileURLs.forEach((url) => {
          const deletePromise = storage.refFromURL(url).delete();
          deletePromises.push(deletePromise);
        });
      }

      Promise.all(deletePromises)
        .then(() => {
          // Upload new photos and files
          const uploadPromises = [];

          const newPhotoURLs = [];
          for (let i = 0; i < editedPhotoUploads.length; i++) {
            const photo = editedPhotoUploads[i];
            const photoRef = storage
              .ref()
              .child("NotificationPhotos")
              .child(photo.name);
            const uploadPromise = photoRef.put(photo).then((snapshot) => {
              return snapshot.ref.getDownloadURL();
            });
            uploadPromises.push(uploadPromise);
            uploadPromise.then((url) => {
              newPhotoURLs.push(url);
            });
          }
          const newFileURLs = [];
          for (let i = 0; i < editedFileUploads.length; i++) {
            const file = editedFileUploads[i];
            const fileRef = storage
              .ref()
              .child("NotificationFiles")
              .child(file.name);
            const uploadPromise = fileRef.put(file).then((snapshot) => {
              return snapshot.ref.getDownloadURL();
            });
            uploadPromises.push(uploadPromise);
            uploadPromise.then((url) => {
              newFileURLs.push(url);
            });
          }

          Promise.all(uploadPromises)
            .then(() => {
              updateData.photoURLs = newPhotoURLs;
              updateData.fileURLs = newFileURLs;

              // Update the notification in Firestore
              db.collection("notification")
                .doc(notificationId)
                .update(updateData)
                .then(() => {
                  $("#editNotificationModal").modal("hide");
                  fetchNotificationDetails(notificationId);
                })
                .catch((error) => {
                  console.error("Error updating notification: ", error);
                });
            })
            .catch((error) => {
              console.error("Error uploading files: ", error);
            });
        })
        .catch((error) => {
          console.error("Error deleting previous files: ", error);
        });
    })
    .catch((error) => {
      console.error("Error fetching notification details: ", error);
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
    .get()
    .then((doc) => {
      const notificationData = doc.data();
      const deletePromises = [];
      if (notificationData.photoURLs && notificationData.photoURLs.length > 0) {
        notificationData.photoURLs.forEach((url) => {
          const deletePromise = storage.refFromURL(url).delete();
          deletePromises.push(deletePromise);
        });
      }

      if (notificationData.fileURLs && notificationData.fileURLs.length > 0) {
        notificationData.fileURLs.forEach((url) => {
          const deletePromise = storage.refFromURL(url).delete();
          deletePromises.push(deletePromise);
        });
      }

      Promise.all(deletePromises)
        .then(() => {
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
        })
        .catch((error) => {
          console.error("Error deleting files: ", error);
        });
    })
    .catch((error) => {
      console.error("Error fetching notification details: ", error);
    });
}

// Get the notification ID and fetch details on page load
notificationId = getNotificationId();
fetchNotificationDetails(notificationId);
