
# 🌈 AuraLink – Personal Energy Color Generator  
✨ Discover Your Inner Energy Through Beautiful Animated Auras

<p align="center">
  <img src="assets/README-banner.svg" alt="AuraLink — Personal Energy Color Generator" width="800px" height="800px" />
</p>

AuraLink is an interactive aura-visualization web app that generates a **personal energy aura** based on your mood, emotions, and personality responses.  
It features **smooth gradients, glowing rings, animations, and dynamic UI transitions** to create a magical and personalized visual experience.

---

## 🚀 Live Demo
🔗 **Website:** https://auralink-9ed4f.web.app  
⚡ Hosted globally with **Firebase Hosting** + automatic HTTPS.

---

## 🎨 Features

- 🌟 Mood & personality quiz  
- 🎨 Dynamic aura color generation  
- 🔮 Animated aura ring  
- ✨ Gradient background transitions  
- 🧭 Smooth screen navigation (Welcome → Questions → Result)  
- 📥 Save & Download aura as an image  
- 📤 Share aura link  
- 📱 Fully responsive  
- ⚡ Lightweight (HTML + CSS + Vanilla JS)

---

# 📁 Project Structure (Firebase Build Version)

Firebase deploys the **build/** directory:

```
Auralink/
├── build/
│   ├── index.html        # UI pages (welcome, questions, result)
│   ├── style.css         # Glows, gradients, animations
│   ├── script.js         # Aura logic, navigation, save, share
│   ├── assets/           # Icons, images, banners
│   └── 404.html          # Fallback for Firebase routing
├── firebase.json         # Firebase hosting config
├── .firebaserc
└── package.json
```

### firebase.json

```json
{
  "hosting": {
    "public": "build",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ]
  }
}
```

---

# 🔄 Navigation Flow (How the App Works)

AuraLink uses **section-based navigation**—all screens exist in one HTML page, and JavaScript switches visibility.

### HTML Sections

```html
<section id="welcome-screen"></section>
<section id="question-screen" class="hidden"></section>
<section id="result-screen" class="hidden"></section>
```

### JavaScript Navigation

```js
function showNextQuestion() {
    const currentQuestionElement = questions[currentQuestion];
    const selectedOption = currentQuestionElement.querySelector('input:checked');
    
    if (selectedOption) {
        const questionName = selectedOption.name;
        userAnswers[questionName] = selectedOption.value;
        if (currentQuestion < questions.length - 1) {
            questions[currentQuestion].classList.remove('active');
            currentQuestion++;
            questions[currentQuestion].classList.add('active');
            updateProgress();
            updateNavigationButtons();
        }
    } else {
        // Show error animation
        currentQuestionElement.style.animation = 'shake 0.5s';
        setTimeout(() => {
            currentQuestionElement.style.animation = '';
        }, 500);
    }
}
```

---

# 🔮 Aura Generation Logic

AuraLink determines your aura using answer scoring → mood → color selection → animated rendering.

### 1️⃣ Aura Color Palettes

```js
const auraPresets = {
    calm: ["#6ECEDD", "#A8E6CF"],
    creative: ["#6A5ACD", "#C084FC"],
    energetic: ["#FF6F61", "#FFB88C"],
    balanced: ["#7ED957", "#B2F7EF"]
};
```

### 2️⃣ Handling Answers

```js
let score = {
    calm: 0,
    creative: 0,
    energetic: 0,
    balanced: 0
};

function updateScore(type) {
    score[type]++;
}
```

### 3️⃣ Calculating the Final Aura

```js
function generateAura() {
    const currentQuestionElement = questions[currentQuestion];
    const selectedOption = currentQuestionElement.querySelector('input:checked');
    
    if (selectedOption) {
        // Save final answer
        const questionName = selectedOption.name;
        userAnswers[questionName] = selectedOption.value;
        
        // Calculate aura based on answers
        const aura = calculateAura();
        
        // Show result screen
        quizScreen.classList.remove('active');
        resultScreen.classList.add('active');
        
        // Display aura
        displayAura(aura);
    }
}

function calculateAura() {
    // Simple algorithm to determine aura based on answers
    const mood = userAnswers.mood;
    const symbol = userAnswers.symbol;
    
    // Primary aura based on mood
    let aura = auraColors[mood] || auraColors.happy;
    
    // Secondary influence from symbol
    if (symbol && auraColors[symbol]) {
        // Blend colors for more unique results
        aura = {
            ...aura,
            name: `${auraColors[symbol].name} ${aura.name}`,
            gradient: `linear-gradient(135deg, ${aura.color}, ${auraColors[symbol].color})`
        };
    }
    
    return aura;
}

```

### 4️⃣ Rendering the Aura Ring

```js
function displayAura(aura) {
    // Apply aura styling
    auraResult.style.background = aura.gradient;
    auraResult.style.boxShadow = `0 0 50px ${aura.color}`;
    auraName.textContent = aura.name;
    auraName.style.color = aura.color;
    
    // Select and display appropriate quote
    const mood = userAnswers.mood;
    const moodQuotes = quotes[mood] || quotes.happy;
    const randomQuote = moodQuotes[Math.floor(Math.random() * moodQuotes.length)];
    
    quoteText.textContent = `"${randomQuote.text}"`;
    quoteAuthor.textContent = `- ${randomQuote.author}`;
}
```

### 5️⃣ Background Gradient Animation

```js
document.body.style.background = `
    linear-gradient(135deg, ${aura.colors[0]}, ${aura.colors[1]})
`;
```

---

# 📥 Download Aura (As PNG)

```js
function saveAura() {
    // Create a canvas to capture the aura
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 400;
    
    canvas.width = size;
    canvas.height = size;
    
    // Draw aura
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(0.3, auraResult.style.background.split(',')[1].trim());
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Convert to image and download
    const link = document.createElement('a');
    link.download = `my-aura-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    
    // Show success message
    showNotification('Aura saved successfully!');
}
```

---

# 📤 Share Aura

```js
function shareAura() {
    const text = `My Personal Aura: ${auraName.textContent}\nDiscover yours: https://auralink-9ed4f.web.app`;

    if (navigator.share) {
        navigator.share({
            title: "My Personal Aura",
            text,
            url: "https://auralink-9ed4f.web.app"
        });
    } else {
        navigator.clipboard.writeText(text);
        showNotification("Aura link copied!");
    }
}

```

---

# 📤 Keydown event handler

```js
function handleKeyboard(e) {
    if (quizScreen.classList.contains('active')) {
        switch(e.key) {
            case 'ArrowLeft':
                if (currentQuestion > 0) showPreviousQuestion();
                break;
            case 'ArrowRight':
            case 'Enter':
                if (currentQuestion < questions.length - 1) {
                    showNextQuestion();
                } else if (currentQuestion === questions.length - 1) {
                    generateAura();
                }
                break;
            case '1':
            case '2':
            case '3':
            case '4':
                const index = parseInt(e.key) - 1;
                const options = questions[currentQuestion].querySelectorAll('.option-card');
                if (options[index]) {
                    options[index].click();
                }
                break;
        }
    }
}
```

---


# 🌍 Firebase Hosting Deployment

### 1️⃣ Initialize

```
firebase init
```

✔ Select **Hosting**  
✔ Public directory → `build`  
✔ Configure as SPA → Yes  

---

### 2️⃣ Deploy

```
firebase deploy
```

Your site becomes live at:

```
https://PROJECT-ID.web.app
```

---

# 💡 Future Enhancements

- 🔮 AI-based aura prediction  
- 🎧 Music-responsive aura  
- 💜 User accounts with Firebase Auth  
- 🖼 Multiple aura style themes  
- 🎁 Share aura as animated video  

---

# ✨ Author

**Harini Neha Kumar**  
🌟 Frontend Developer | Creative UI Builder  
Crafting meaningful and visually beautiful web experiences.

---


