let mic = chrome.runtime.getURL("assets/mic.svg");
let stop = chrome.runtime.getURL("assets/stop.svg");
let loading = chrome.runtime.getURL("assets/loading.svg");
let isRecording = false;
let mediaRecorder;
let recordedChunks = [];
const button = document.createElement("button");

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
      button.innerHTML = `<img src="${loading}" width="32" height="32"/>`; // Loading spinner
      sendToWhisper(blob);
    };
    mediaRecorder.start();
  });
}

function sendToWhisper(blob) {
  chrome.storage.sync.get("OPENAI_API_KEY", (data) => {
    //console.log(data);
    const apiKey = data.OPENAI_API_KEY;
    if (!apiKey) {
      alert("API Key not found. Please set it in the popup.");
      button.innerHTML = `<img src="${mic}" width="32" height="32"/>`; // Reset to microphone icon
      return;
    }

    const formData = new FormData();
    formData.append("file", blob, "audio.webm");
    formData.append("model", "whisper-1");
    //console.log(formData);

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
          const event = new Event("input", { bubbles: true });
          textBox.dispatchEvent(event);
        }
        //console.log(data.text);

        button.innerHTML = `<img src="${mic}" width="32" height="32"/>`; // Reset to microphone icon
      })
      .catch((error) => {
        console.error("Error:", error);
        button.innerHTML = `<img src="${mic}" width="32" height="32"/>`; // Reset to microphone icon
      });
  });
}
function runScript() {
  if (!document.body.contains(button)) {
    button.innerHTML = `<img src="${mic}" width="32" height="32"/>`;
    button.style.marginBottom = "5px";
    button.style.marginRight = "5px";
    button.style.zIndex = 1000;

    const parentElement = document.getElementsByClassName(
      "flex items-end gap-1.5 md:gap-3.5"
    )[0];

    if (parentElement) {
      //console.log("parentElement");
      parentElement.appendChild(button);
    } else {
      //console.log("body");
      document.body.appendChild(button);
    }

    button.addEventListener("click", () => {
      if (isRecording) {
        mediaRecorder.stop();
        button.innerHTML = `<img src="${mic}" width="32" height="32"/>`; // Microphone icon
      } else {
        startRecording();
        button.innerHTML = `<img src="${stop}" width="32" height="32"/>`; // Stop icon
      }
      isRecording = !isRecording;
    });
  }
}
runScript();

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === "childList") {
      // Add specific conditions to avoid unnecessary re-renders
      //console.log(mutation.target.classList.value);

      if (
        mutation.target.classList.value ===
        "flex items-center pb-0.5 juice:pb-0"
      )
        //console.log("Mutation observed");
        runScript();
    }
  });
});

observer.observe(document.body, { childList: true, subtree: true });
