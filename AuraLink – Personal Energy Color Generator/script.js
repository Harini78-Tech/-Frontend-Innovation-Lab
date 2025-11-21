// DOM Elements
const welcomeScreen = document.getElementById('welcome-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const startBtn = document.getElementById('start-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const restartBtn = document.getElementById('restart-btn');
const saveBtn = document.getElementById('save-btn');
const shareBtn = document.getElementById('share-btn');
const quizForm = document.getElementById('quiz-form');
const questions = document.querySelectorAll('.question');
const progressFill = document.querySelector('.progress-fill');
const currentQuestionSpan = document.getElementById('current-question');
const auraResult = document.getElementById('aura-result');
const auraName = document.getElementById('aura-name');
const quoteText = document.getElementById('quote-text');
const quoteAuthor = document.getElementById('quote-author');

// Quiz State
let currentQuestion = 0;
const userAnswers = {};

// Aura Color Database
const auraColors = {
    happy: { color: '#FFD700', name: 'Golden Joy', gradient: 'linear-gradient(135deg, #FFD700, #FFA500)' },
    calm: { color: '#4FC3F7', name: 'Serene Blue', gradient: 'linear-gradient(135deg, #4FC3F7, #29B6F6)' },
    energetic: { color: '#FF9800', name: 'Fiery Orange', gradient: 'linear-gradient(135deg, #FF9800, #FF5722)' },
    thoughtful: { color: '#9C27B0', name: 'Deep Purple', gradient: 'linear-gradient(135deg, #9C27B0, #7B1FA2)' },
    flower: { color: '#4CAF50', name: 'Vibrant Green', gradient: 'linear-gradient(135deg, #4CAF50, #66BB6A)' },
    fire: { color: '#FF5722', name: 'Passionate Red', gradient: 'linear-gradient(135deg, #FF5722, #E64A19)' },
    water: { color: '#2196F3', name: 'Ocean Blue', gradient: 'linear-gradient(135deg, #2196F3, #1976D2)' },
    moon: { color: '#7E57C2', name: 'Mystic Purple', gradient: 'linear-gradient(135deg, #7E57C2, #5E35B1)' },
    sunrise: { color: '#FFB74D', name: 'Dawn Gold', gradient: 'linear-gradient(135deg, #FFB74D, #FFA726)' },
    noon: { color: '#FFD54F', name: 'Sunshine Yellow', gradient: 'linear-gradient(135deg, #FFD54F, #FFCA28)' },
    sunset: { color: '#E57373', name: 'Twilight Pink', gradient: 'linear-gradient(135deg, #E57373, #EF5350)' },
    night: { color: '#5C6BC0', name: 'Midnight Blue', gradient: 'linear-gradient(135deg, #5C6BC0, #3949AB)' },
    nature: { color: '#66BB6A', name: 'Forest Green', gradient: 'linear-gradient(135deg, #66BB6A, #4CAF50)' },
    urban: { color: '#78909C', name: 'Urban Gray', gradient: 'linear-gradient(135deg, #78909C, #546E7A)' },
    home: { color: '#8D6E63', name: 'Warm Brown', gradient: 'linear-gradient(135deg, #8D6E63, #6D4C41)' },
    air: { color: '#80DEEA', name: 'Sky Blue', gradient: 'linear-gradient(135deg, #80DEEA, #4DD0E1)' },
    earth: { color: '#8D6E63', name: 'Earthy Brown', gradient: 'linear-gradient(135deg, #8D6E63, #6D4C41)' }
};

// Quotes Database
const quotes = {
    happy: [
        { text: "Happiness is not something ready made. It comes from your own actions.", author: "Dalai Lama" },
        { text: "The purpose of our lives is to be happy.", author: "Dalai Lama" },
        { text: "Joy is the simplest form of gratitude.", author: "Karl Barth" }
    ],
    calm: [
        { text: "Peace is the result of retraining your mind to process life as it is, rather than as you think it should be.", author: "Wayne Dyer" },
        { text: "Calm mind brings inner strength and self-confidence.", author: "Dalai Lama" },
        { text: "The best cure for the body is a quiet mind.", author: "Napoleon Bonaparte" }
    ],
    energetic: [
        { text: "Energy and persistence conquer all things.", author: "Benjamin Franklin" },
        { text: "Your energy introduces you before you even speak.", author: "Unknown" },
        { text: "The energy of the mind is the essence of life.", author: "Aristotle" }
    ],
    thoughtful: [
        { text: "The soul becomes dyed with the color of its thoughts.", author: "Marcus Aurelius" },
        { text: "We are what we think. All that we are arises with our thoughts. With our thoughts, we make the world.", author: "Buddha" },
        { text: "Thoughts are the seeds of actions.", author: "Ralph Waldo Emerson" }
    ]
};

// Event Listeners
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    startBtn.addEventListener('click', startQuiz);
    prevBtn.addEventListener('click', showPreviousQuestion);
    nextBtn.addEventListener('click', showNextQuestion);
    submitBtn.addEventListener('click', generateAura);
    restartBtn.addEventListener('click', restartQuiz);
    saveBtn.addEventListener('click', saveAura);
    shareBtn.addEventListener('click', shareAura);
    
    // Add keyboard navigation
    document.addEventListener('keydown', handleKeyboard);
    
    // Add option selection with mouse events
    setupOptionSelection();
}

function startQuiz() {
    welcomeScreen.classList.remove('active');
    quizScreen.classList.add('active');
    updateProgress();
}

function showPreviousQuestion() {
    if (currentQuestion > 0) {
        questions[currentQuestion].classList.remove('active');
        currentQuestion--;
        questions[currentQuestion].classList.add('active');
        updateProgress();
        updateNavigationButtons();
    }
}

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

function updateProgress() {
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    progressFill.style.width = `${progress}%`;
    currentQuestionSpan.textContent = currentQuestion + 1;
}

function updateNavigationButtons() {
    prevBtn.style.display = currentQuestion > 0 ? 'inline-block' : 'none';
    nextBtn.style.display = currentQuestion < questions.length - 1 ? 'inline-block' : 'none';
    submitBtn.style.display = currentQuestion === questions.length - 1 ? 'inline-block' : 'none';
}

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

function restartQuiz() {
    // Reset quiz state
    currentQuestion = 0;
    Object.keys(userAnswers).forEach(key => delete userAnswers[key]);
    
    // Reset form
    quizForm.reset();
    
    // Remove selected classes from options
    document.querySelectorAll('.option-card.selected').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Show first question
    questions.forEach((question, index) => {
        question.classList.toggle('active', index === 0);
    });
    
    // Update UI
    updateProgress();
    updateNavigationButtons();
    
    // Switch screens
    resultScreen.classList.remove('active');
    quizScreen.classList.add('active');
}

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

// Download aura after result
// Download full result page including aura
document.getElementById("save-btn")?.addEventListener("click", function () {
    const resultSection = document.getElementById("result-screen");

    html2canvas(resultSection, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null, // keep your gradient
        scale: 2 // high quality
    }).then(canvas => {
        const link = document.createElement("a");
        link.download = "My_Aura_Result.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    });
});


function shareAura() {
    const auraNameText = auraName.textContent;
    const auraDescription = document.getElementById("aura-description")?.textContent || "";
    const siteLink = " https://auralink-9ed4f.web.app"; // ⬅ Replace with your real published website URL

    if (navigator.share) {
        navigator.share({
            title: 'My Personal Energy Aura',
            text: `✨ My Aura: ${auraNameText}\n\n${auraDescription}\n\nDiscover yours here: ${siteLink}`,
            url: siteLink
        });
    } else {
        // Fallback: copy to clipboard
        const shareText =
            `✨ My Personal Energy Aura: ${auraNameText}\n${auraDescription}\n\nFind your aura here: ${siteLink}`;

        navigator.clipboard.writeText(shareText);
        showNotification('Your aura details and link have been copied!');
    }
}


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

function setupOptionSelection() {
    document.querySelectorAll('.option-card').forEach(card => {
        card.addEventListener('click', function() {
            // Remove selected class from siblings
            const siblings = this.parentElement.querySelectorAll('.option-card');
            siblings.forEach(sibling => sibling.classList.remove('selected'));
            
            // Add selected class to clicked card
            this.classList.add('selected');
            
            // Check the radio input
            const radio = this.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
            
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
        
        // Add hover sound effect simulation
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
        });
    });
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(106, 17, 203, 0.9);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
