document.addEventListener("DOMContentLoaded", function () {
  const apiKeyInput = document.getElementById("api");
  const saveBtn = document.getElementById("saveBtn");
  const apiMessage = document.getElementById("apiMessage");
  const changeBtn = document.getElementById("changeBtn");
  const formContainer = document.getElementById("formContainer");
  const invalidApiKey = document.getElementById("invalidApiKey");

  chrome.storage.sync.get("OPENAI_API_KEY", function (result) {
    if (result.OPENAI_API_KEY) {
      formContainer.classList.add("hidden");
      changeBtn.classList.remove("hidden");
    }
  });

  // Save button click event
  saveBtn.addEventListener("click", function () {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
      apiKeyInput.classList.add("invalid");
      return;
    }
    if (apiKey.substring(0, 3) !== "sk-") {
      invalidApiKey.classList.remove("hidden");
      return;
    }
    if (apiKey) {
      chrome.storage.sync.set({ OPENAI_API_KEY: apiKey });
      apiKeyInput.classList.remove("invalid");
      invalidApiKey.classList.add("hidden");
      apiMessage.classList.remove("hidden");
      changeBtn.classList.remove("hidden");
      saveBtn.classList.add("hidden");
      apiKeyInput.classList.add("hidden");
    }
  });

  // Change button click event
  changeBtn.addEventListener("click", function () {
    apiKeyInput.classList.remove("hidden");
    apiMessage.classList.add("hidden");
    changeBtn.classList.add("hidden");
    saveBtn.classList.remove("hidden");
  });
});
