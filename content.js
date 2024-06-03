let isRecording = false;
let mediaRecorder;
let recordedChunks = [];

const button = document.createElement("button");
button.innerText = "Start Recording";
button.style.position = "fixed";
button.style.top = "10px";
button.style.right = "10px";
button.style.zIndex = 1000;
const parentElement = document.getElementsByClassName(
  "flex items-end gap-1.5 md:gap-3.5"
)[0];
console.log(parentElement);
if (parentElement) {
  parentElement.appendChild(button);
} else {
  document.body.appendChild(button);
}

button.addEventListener("click", () => {
  if (isRecording) {
    mediaRecorder.stop();
    button.innerText = "Start Recording";
  } else {
    startRecording();
    button.innerText = "Stop Recording";
  }
  isRecording = !isRecording;
});

function startRecording() {
  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: "audio/webm" });
      recordedChunks = [];
      sendToWhisper(blob);
    };
    mediaRecorder.start();
  });
}

function sendToWhisper(blob) {
  chrome.storage.sync.get("OPENAI_API_KEY", (data) => {
    console.log(data);
    const apiKey = data.OPENAI_API_KEY;
    if (!apiKey) {
      alert("API Key not found. Please set it in the popup.");
      return;
    }

    const formData = new FormData();
    formData.append("file", blob, "audio.webm");
    formData.append("model", "whisper-1");
    console.log(formData);

    fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        const textBox = document.querySelector("textarea"); // Adjust selector as needed
        if (textBox) {
          textBox.value = data.text;
        }
        console.log(data.text);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
}
