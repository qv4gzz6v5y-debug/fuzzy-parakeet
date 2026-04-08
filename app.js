import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, setDoc, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 회원가입
const signupForm = document.getElementById("signup-form");
if(signupForm){
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("signup-email").value;
    const username = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;
    try{
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        username, email, createdAt: new Date()
      });
      alert("회원가입 완료!");
    }catch(err){
      alert(err.message);
    }
  });
}

// 로그인
const loginForm = document.getElementById("login-form");
if(loginForm){
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;
    try{
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username","==",username));
      const snapshot = await getDocs(q);
      if(snapshot.empty) return alert("아이디가 없습니다");
      const userData = snapshot.docs[0].data();
      const email = userData.email;
      await signInWithEmailAndPassword(auth, email, password);
      alert("로그인 성공!");
    }catch(err){
      alert(err.message);
    }
  });
}

// 작품 업로드
const uploadForm = document.getElementById("upload-form");
if(uploadForm){
  uploadForm.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const url = document.getElementById("work-url").value;
    const type = document.getElementById("work-type").value;
    const user = auth.currentUser;
    if(!user) return alert("로그인 필요");
    await addDoc(collection(db, "works"), {url, type, user: user.uid, createdAt: new Date()});
    alert("업로드 완료!");
  });
}

// 작품 보기 & 필터링
const filterType = document.getElementById("filter-type");
const worksList = document.getElementById("works-list");
if(filterType){
  filterType.addEventListener("change", async ()=>{
    const type = filterType.value;
    let q;
    if(type==="all") q = collection(db, "works");
    else q = query(collection(db, "works"), where("type","==",type));
    const snapshot = await getDocs(q);
    worksList.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      let elem;
      if(data.type==="video"){
        elem = `<video width="320" height="240" controls src="${data.url}"></video>`;
      }else{
        elem = `<img width="320" src="${data.url}" />`;
      }
      worksList.innerHTML += `<div>${elem}</div>`;
    });
  });
}