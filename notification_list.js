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
const notificationListContainer = document.getElementById("notificationList");

// Fetch notifications from Firestore
function fetchNotifications() {
  db.collection("notification")
    .get()
    .then((querySnapshot) => {
      notificationListContainer.innerHTML = "";
      querySnapshot.forEach((doc) => {
        const notificationData = doc.data();
        const notificationId = doc.id;
        const notificationItem = createNotificationItem(
          notificationId,
          notificationData
        );
        notificationListContainer.appendChild(notificationItem);
      });
    })
    .catch((error) => {
      console.error("Error fetching notifications: ", error);
    });
}

// Create a notification item element
function createNotificationItem(notificationId, notificationData) {
  const notificationItem = document.createElement("div");
  notificationItem.classList.add("notification-item", "mb-3", "p-3", "border");
  notificationItem.setAttribute("data-id", notificationId);
  notificationItem.innerHTML = `
      <h5 class="notification-title">${notificationData.title}</h5>
      <p class="notification-date">${notificationData.date}</p>
      <p class="notification-description">${notificationData.description}</p>
    `;
  notificationItem.addEventListener("click", () => {
    window.location.href = `notification_details.html?id=${notificationId}`;
  });
  return notificationItem;
}

// Fetch notifications on page load
fetchNotifications();
