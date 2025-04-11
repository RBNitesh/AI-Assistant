// Mobile menu toggle functionality
document.getElementById("mobileMenuBtn").addEventListener("click", function () {
  document.getElementById("navMenu").classList.toggle("active");

  // Toggle dropdowns for mobile
  document.querySelectorAll(".dropdown").forEach((dropdown) => {
    dropdown.classList.toggle("active");
  });
});

// Close mobile menu when clicking outside
document.addEventListener("click", function (event) {
  const navMenu = document.getElementById("navMenu");
  const mobileBtn = document.getElementById("mobileMenuBtn");

  if (!navMenu.contains(event.target) && event.target !== mobileBtn) {
    navMenu.classList.remove("active");
  }
});

// Chatbot functionality
document.addEventListener("DOMContentLoaded", function () {
  const messageInput = document.getElementById("messageInput");
  const sendButton = document.getElementById("sendButton");
  const chatMessages = document.getElementById("chatMessages");
  const thinking = document.getElementById("thinking");
  const quickActionButtons = document.querySelectorAll(".quick-action-btn");
  let knowledgeBase = {}; // Declare global variable

  fetch("chatbotData.json") // <-- Replace with the actual path to your JSON file
    .then((response) => response.json())
    .then((data) => {
      knowledgeBase = data;
    })
    .catch((error) => {
      console.error("Error loading knowledge base:", error);
    });

  // Function to add messages to the chat
  function addMessage(text, isUser = false) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    messageDiv.classList.add(isUser ? "user-message" : "bot-message");
    messageDiv.textContent = text;
    chatMessages.insertBefore(messageDiv, thinking);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Function to process user input and generate response
  function processMessage(userMessage) {
    // Show thinking animation
    thinking.style.display = "block";
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Simulate processing delay
    setTimeout(() => {
      thinking.style.display = "none";

      // Get appropriate response based on user input
      const response = getResponse(userMessage);
      addMessage(response);
    }, 1000);
  }

  // Function to find the most relevant response from knowledge base
  function getResponse(userInput) {
    userInput = userInput.toLowerCase();

    // Check each category in the knowledge base
    for (const category in knowledgeBase) {
      if (category === "default") continue;

      // Check if input contains any keywords from this category
      const matchesKeyword = knowledgeBase[category].keywords.some((keyword) =>
        userInput.includes(keyword.toLowerCase())
      );

      if (matchesKeyword) {
        // Return a random response from this category
        const responses = knowledgeBase[category].responses;
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }

    // If no matches found, return a default response
    return knowledgeBase
      .default[Math.floor(Math.random() * knowledgeBase.default.length)];
  }

  // Event listener for send button
  sendButton.addEventListener("click", function () {
    const userMessage = messageInput.value.trim();

    if (userMessage !== "") {
      addMessage(userMessage, true);
      messageInput.value = "";
      processMessage(userMessage);
    }
  });

  // Event listener for Enter key in input field
  messageInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      const userMessage = messageInput.value.trim();

      if (userMessage !== "") {
        addMessage(userMessage, true);
        messageInput.value = "";
        processMessage(userMessage);
      }
    }
  });

  // Enable/disable send button based on input
  messageInput.addEventListener("input", function () {
    sendButton.disabled = messageInput.value.trim() === "";
  });

  // Set up quick action buttons
  quickActionButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const query = this.getAttribute("data-query");
      addMessage(query, true);
      processMessage(query);
    });
  });

  // Initialize - disable send button if input is empty
  sendButton.disabled = messageInput.value.trim() === "";

  // Add some additional features for better UX
  function enhanceChatExperience() {
    // Add animation when bot is thinking
    const thinkingDots = document.querySelectorAll(".dot");
    thinkingDots.forEach((dot, index) => {
      dot.style.animationDelay = `${index * 0.2}s`;
    });

    // Focus input when chat container is clicked
    document
      .querySelector(".chatbot-container")
      .addEventListener("click", function () {
        messageInput.focus();
      });

    // Random greeting messages for variety
    const greetings = [
      "Hello there! How can I help you with your college questions today?",
      "Welcome to Sri Venkateswara College of Engineering and Technology! What would you like to know about our programs?",
      "Hi! I'm here to answer your questions about admissions, campus life, and more.",
    ];

    // Add typing indicator for a more realistic chat experience
    function simulateTyping(text, callback) {
      thinking.style.display = "block";
      setTimeout(() => {
        thinking.style.display = "none";
        callback(text);
      }, text.length * 10); // Simulate typing speed based on message length
    }
  }

  // Call the enhancement function
  enhanceChatExperience();

  // Add a feature to suggest related questions based on the context
  function suggestRelatedQuestions(category) {
    const suggestions = {
      // admission: [
      //   "When is the application deadline?",
      //   "What SAT score do I need?",
      //   "How can I schedule a campus visit?",
      // ],
      // programs: [
      //   "What majors do you offer?",
      //   "Tell me about your engineering program",
      //   "Do you offer online degrees?",
      // ],
      // financial: [
      //   "How much is tuition?",
      //   "What scholarships are available?",
      //   "How do I apply for financial aid?",
      // ],
      // campus: [
      //   "What is housing like?",
      //   "Tell me about meal plans",
      //   "What student clubs do you have?",
      // ],
      // career: [
      //   "What is your job placement rate?",
      //   "Do you offer internships?",
      //   "Which companies recruit from your school?",
      // ],
    };

    if (suggestions[category]) {
      // Wait a moment before showing suggestions
      setTimeout(() => {
        const suggestionContainer = document.createElement("div");
        suggestionContainer.classList.add("related-suggestions");
        suggestionContainer.innerHTML = `
            <p class="suggestion-title">You might also want to ask:</p>
            <div class="suggestion-buttons">
              ${suggestions[category]
                .map(
                  (s) =>
                    `<button class="quick-action-btn" data-query="${s}">${s}</button>`
                )
                .join("")}
            </div>
          `;
        chatMessages.appendChild(suggestionContainer);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Add event listeners to new suggestion buttons
        suggestionContainer
          .querySelectorAll(".quick-action-btn")
          .forEach((btn) => {
            btn.addEventListener("click", function () {
              const query = this.getAttribute("data-query");
              addMessage(query, true);
              processMessage(query);
              suggestionContainer.remove();
            });
          });
      }, 2000);
    }
  }

  // Sample usage of the suggestion feature
  function identifyCategory(message) {
    message = message.toLowerCase();

    for (const category in knowledgeBase) {
      if (category === "default") continue;

      if (
        knowledgeBase[category].keywords.some((keyword) =>
          message.includes(keyword.toLowerCase())
        )
      ) {
        return category;
      }
    }

    return null;
  }

  // Enhance the processMessage function to include suggestions
  const originalProcessMessage = processMessage;
  processMessage = function (userMessage) {
    const category = identifyCategory(userMessage);

    // Show thinking animation
    thinking.style.display = "block";
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Simulate processing delay
    setTimeout(() => {
      thinking.style.display = "none";

      // Get appropriate response based on user input
      const response = getResponse(userMessage);
      addMessage(response);

      // Show related questions if a category was identified
      if (category) {
        suggestRelatedQuestions(category);
      }
    }, 1000);
  };
});
