const API_BASE = "http://localhost:5000/api";

let html5QrCode;
let isScanning = false;

const scanStatus = document.getElementById("scanStatus");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");

startBtn.addEventListener("click", startScanner);
stopBtn.addEventListener("click", stopScanner);

function startScanner() {

  if (isScanning) return;

  const teamId = document.getElementById("teamId").value.trim();
  if (!teamId) {
    alert("Enter Team ID first");
    return;
  }

  html5QrCode = new Html5Qrcode("reader");

  const config = {
    fps: 10,
    qrbox: { width: 250, height: 250 }
  };

  html5QrCode.start(
    { facingMode: "environment" },
    config,
    async (decodedText) => {
      if (!isScanning) return;

      await handleScan(teamId, decodedText);
    },
    (errorMessage) => {
      // ignore scan frame errors
    }
  );

  isScanning = true;
  scanStatus.innerText = "Camera Started. Scan a QR Code.";
}

async function handleScan(teamId, scanCode) {

  isScanning = false;
  await html5QrCode.stop();

  scanStatus.innerText = "Validating...";

  try {
    const res = await fetch(API_BASE + "/scan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        teamId,
        scanCode
      })
    });

    const data = await res.json();

    if (data.success) {
      scanStatus.innerText = "✅ Clue Solved!";
      scanStatus.style.color = "lime";
    } else {
      scanStatus.innerText = "❌ Invalid QR Code";
      scanStatus.style.color = "red";
    }

  } catch (err) {
    scanStatus.innerText = "Server Error";
    scanStatus.style.color = "orange";
  }

  // Restart camera automatically after 3 seconds
  setTimeout(() => {
    scanStatus.style.color = "#f5c542";
    startScanner();
  }, 3000);
}

async function stopScanner() {
  if (html5QrCode && isScanning) {
    await html5QrCode.stop();
    isScanning = false;
    scanStatus.innerText = "Camera Stopped.";
  }
}
