document.addEventListener("DOMContentLoaded", function () {
  const apiKeyInput = document.getElementById("api");
  const saveBtn = document.getElementById("saveBtn");
  const changeBtn = document.getElementById("changeBtn");
  const formContainer = document.getElementById("formContainer");
  const message = document.getElementById("message");

  chrome.storage.sync.get("OPENAI_API_KEY", function (result) {
    if (result.OPENAI_API_KEY) {
      formContainer.classList.add("hidden");
      changeBtn.classList.remove("hidden");
    }
  });

  // Save button click event
  saveBtn.addEventListener("click", function () {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      chrome.storage.sync.set({ OPENAI_API_KEY: apiKey });
      formContainer.classList.add("hidden");
      changeBtn.classList.remove("hidden");
      message.classList.remove("hidden");
    }
  });

  // Change button click event
  changeBtn.addEventListener("click", function () {
    formContainer.classList.remove("hidden");
    changeBtn.classList.add("hidden");
    message.classList.add("hidden");
  });
});
