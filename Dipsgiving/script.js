import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, runTransaction } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBOo3oLeRSKrf1pT_pVu86XMv_AmtmebNE",
  authDomain: "dipgiving-voting-2024.firebaseapp.com",
  projectId: "dipgiving-voting-2024",
  storageBucket: "dipgiving-voting-2024.firebasestorage.app",
  messagingSenderId: "311832183972",
  appId: "1:311832183972:web:b619f47961ecf7960f5231",
  measurementId: "G-1CB7MRXMME"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const dips = [
  "Spinach Artichoke Dip",
  "Buffalo Chicken Dip",
  "Guacamole",
  "Queso",
  "Hummus"
];

let selectedDip = null;

// Generate radio buttons for dips
const dipsContainer = document.getElementById("dips-container");
const submitVoteButton = document.getElementById("submit-vote");

dips.forEach((dip) => {
  const label = document.createElement("label");
  const radio = document.createElement("input");
  radio.type = "radio";
  radio.name = "dip";
  radio.value = dip;
  radio.addEventListener("change", () => {
    selectedDip = dip;
    submitVoteButton.disabled = false;
  });

  label.appendChild(radio);
  label.appendChild(document.createTextNode(dip));
  dipsContainer.appendChild(label);
  dipsContainer.appendChild(document.createElement("br"));
});

// Submit a vote
async function submitVote(voterName, selectedDip) {
  try {
    const votesRef = doc(db, "votes", "dipResults");
    const voterRef = doc(db, "voters", voterName);

    const voterDoc = await getDoc(voterRef);
    if (voterDoc.exists()) {
      alert("You have already voted!");
      return;
    }

    await runTransaction(db, async (transaction) => {
      const voteDoc = await transaction.get(votesRef);
      const currentVotes = voteDoc.exists() ? voteDoc.data() : {};
      currentVotes[selectedDip] = (currentVotes[selectedDip] || 0) + 1;
      transaction.set(votesRef, currentVotes);
    });

    await setDoc(voterRef, { voted: true });
    alert(`Thank you for voting for ${selectedDip}!`);
  } catch (error) {
    console.error("Error submitting vote: ", error);
  }
}

// Load votes
async function loadVotes() {
  try {
    const votesRef = doc(db, "votes", "dipResults");
    const voteDoc = await getDoc(votesRef);
    if (voteDoc.exists()) {
      const votes = voteDoc.data();
      displayResults(votes);
    }
  } catch (error) {
    console.error("Error loading votes: ", error);
  }
}

// Display results
function displayResults(votes) {
  const resultsList = document.getElementById("results");
  resultsList.innerHTML = "";
  Object.entries(votes).forEach(([dip, count]) => {
    const listItem = document.createElement("li");
    listItem.textContent = `${dip}: ${count} vote(s)`;
    resultsList.appendChild(listItem);
  });
}

// Handle vote submission
submitVoteButton.addEventListener("click", async () => {
  const voterName = prompt("Enter your name:").trim();
  if (!voterName || !selectedDip) return;
  await submitVote(voterName, selectedDip);
  loadVotes();
});

// Load votes on page load
loadVotes();
