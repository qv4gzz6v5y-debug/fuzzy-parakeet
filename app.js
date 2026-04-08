import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, setDoc, doc, addDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_ID",
  storageBucket: "YOUR_BUCKET"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

// 회원가입
window.signUp = async function () {
  const email = document.getElementById('email').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const userCred = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", userCred.user.uid), {
    username: username,
    email: email
  });

  alert("회원가입 완료");
};

// 로그인 (아이디 → 이메일 매핑 필요)
window.login = async function () {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const snapshot = await getDocs(collection(db, "users"));

  let email = null;

  snapshot.forEach(doc => {
    if (doc.data().username === username) {
      email = doc.data().email;
    }
  });

  if (!email) {
    alert("아이디 없음");
    return;
  }

  await signInWithEmailAndPassword(auth, email, password);
  alert("로그인 성공");
};

// 업로드
window.uploadFile = async function () {
  const file = document.getElementById('file').files[0];
  const type = document.getElementById('type').value;

  const storageRef = ref(storage, 'files/' + file.name);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  await addDoc(collection(db, "works"), {
    url: url,
    type: type,
    user: auth.currentUser.uid
  });

  alert("업로드 완료");
};

// 내 작품
window.loadMy = async function (type) {
  const snapshot = await getDocs(collection(db, "works"));
  const container = document.getElementById('items');
  container.innerHTML = "";

  snapshot.forEach(doc => {
    const data = doc.data();

    if (data.user !== auth.currentUser.uid) return;
    if (type !== 'all' && data.type !== type) return;

    const div = document.createElement('div');

    if (data.type === 'video') {
      div.innerHTML = `<video src="${data.url}" controls width="200"></video>`;
    } else {
      div.innerHTML = `<img src="${data.url}" width="200">`;
    }

    container.appendChild(div);
  });
};

// 팀 작품
window.onload = async function () {
  const container = document.getElementById('teamItems');
  if (!container) return;

  const snapshot = await getDocs(collection(db, "works"));

  snapshot.forEach(doc => {
    const data = doc.data();

    const div = document.createElement('div');

    if (data.type === 'video') {
      div.innerHTML = `<video src="${data.url}" controls width="200"></video>`;
    } else {
      div.innerHTML = `<img src="${data.url}" width="200">`;
    }

    container.appendChild(div);
  });
};