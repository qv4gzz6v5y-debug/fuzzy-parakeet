// 🔥 Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  setDoc,
  doc,
  addDoc,
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";


// ⚠️ Firebase 설정 (본인 것으로 교체)
const firebaseConfig = {
  apiKey: "AIzaSyBqbVFcT-DaeKACTvcbrnRCL1X-aQho64k",
  authDomain: "portfolio-df22c.firebaseapp.com",
  projectId: "portfolio-df22c",
  storageBucket: "portfolio-df22c.firebasestorage.app",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

let currentUser = null;


// 🔐 로그인 상태 유지
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
  }
});


// =====================
// 회원가입
// =====================
window.signUp = async function () {
  try {
    const email = document.getElementById("email").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!email || !username || !password) {
      alert("모든 값을 입력하세요");
      return;
    }

    const userCred = await createUserWithEmailAndPassword(auth, email, password);

    // 사용자 정보 저장
    await setDoc(doc(db, "users", userCred.user.uid), {
      username: username,
      email: email,
      createdAt: new Date()
    });

    alert("회원가입 완료!");
    window.location.href = "login.html";

  } catch (error) {
    alert("회원가입 실패: " + error.message);
  }
};


// =====================
// 로그인 (아이디 → 이메일 찾기)
// =====================
window.login = async function () {
  try {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
      alert("입력값을 확인하세요");
      return;
    }

    // 🔥 username으로 이메일 찾기 (최적화된 방식)
    const q = query(collection(db, "users"), where("username", "==", username));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      alert("존재하지 않는 아이디");
      return;
    }

    let email = "";
    snapshot.forEach(doc => {
      email = doc.data().email;
    });

    await signInWithEmailAndPassword(auth, email, password);

    alert("로그인 성공!");
    window.location.href = "index.html";

  } catch (error) {
    alert("로그인 실패: " + error.message);
  }
};


// =====================
// 파일 업로드
// =====================
window.uploadFile = async function () {
  try {
    if (!currentUser) {
      alert("로그인 필요");
      return;
    }

    const file = document.getElementById("file").files[0];
    const type = document.getElementById("type").value;

    if (!file) {
      alert("파일 선택하세요");
      return;
    }

    const fileRef = ref(storage, `files/${Date.now()}_${file.name}`);

    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);

    await addDoc(collection(db, "works"), {
      url: url,
      type: type,
      user: currentUser.uid,
      createdAt: new Date()
    });

    alert("업로드 완료!");

  } catch (error) {
    alert("업로드 실패: " + error.message);
  }
};


// =====================
// 내 작품 불러오기 + 필터
// =====================
window.loadMy = async function (type) {
  try {
    if (!currentUser) {
      alert("로그인 필요");
      return;
    }

    const container = document.getElementById("items");
    if (!container) return;

    container.innerHTML = "불러오는 중...";

    const snapshot = await getDocs(collection(db, "works"));

    container.innerHTML = "";

    snapshot.forEach(doc => {
      const data = doc.data();

      if (data.user !== currentUser.uid) return;
      if (type !== "all" && data.type !== type) return;

      const div = document.createElement("div");
      div.className = "card";

      if (data.type === "video") {
        div.innerHTML = `<video src="${data.url}" controls></video>`;
      } else {
        div.innerHTML = `<img src="${data.url}">`;
      }

      container.appendChild(div);
    });

  } catch (error) {
    alert("불러오기 실패: " + error.message);
  }
};


// =====================
// 팀 작품 전체 보기
// =====================
async function loadTeam() {
  try {
    const container = document.getElementById("teamItems");
    if (!container) return;

    container.innerHTML = "불러오는 중...";

    const snapshot = await getDocs(collection(db, "works"));

    container.innerHTML = "";

    snapshot.forEach(doc => {
      const data = doc.data();

      const div = document.createElement("div");
      div.className = "card";

      if (data.type === "video") {
        div.innerHTML = `<video src="${data.url}" controls></video>`;
      } else {
        div.innerHTML = `<img src="${data.url}">`;
      }

      container.appendChild(div);
    });

  } catch (error) {
    console.error(error);
  }
}


// =====================
// 페이지 로드 시 실행
// =====================
window.addEventListener("DOMContentLoaded", () => {
  loadTeam();
});