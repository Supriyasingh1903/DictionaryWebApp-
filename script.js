document.addEventListener('DOMContentLoaded', function() {
    // Get all elements
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const wordElement = document.getElementById('word');
    const audioBtn = document.getElementById('audio-btn');
    const themeToggle = document.getElementById('theme-btn');
    const fontSelect = document.getElementById('font-select');
    const body = document.body;
    const meaningsContainer = document.getElementById('meanings-container');
    
    // Check saved theme
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.checked = true;
    }
    
    // Check saved font
    const savedFont = localStorage.getItem('font');
    if (savedFont) {
        body.style.fontFamily = savedFont;
        fontSelect.value = savedFont;
    }
    
    // Event listeners
    searchBtn.addEventListener('click', searchWord);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchWord();
    });
    themeToggle.addEventListener('change', toggleTheme);
    fontSelect.addEventListener('change', changeFont);
    
    // Search function
    async function searchWord() {
        const word = searchInput.value.trim();
        if (!word) return;
        
        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            if (!response.ok) throw new Error("Word not found");
            const data = await response.json();
            showWord(data[0]);
        } catch (error) {
            showError(error.message);
        }
    }
    
    // Display word data
    function showWord(data) {
        wordElement.textContent = data.word;
        
        // Get phonetic text or audio text
        const phoneticText = data.phonetic || 
            (data.phonetics.find(p => p.text)?.text) || 
            "No phonetic available";
        document.querySelector('.phonetic').textContent = phoneticText;
        
        // Get first audio source
        const audioSrc = data.phonetics.find(p => p.audio)?.audio;
        
        // Setup audio button
        audioBtn.onclick = function() {
            if (audioSrc) {
                new Audio(audioSrc).play();
            } else {
                alert("No pronunciation available");
            }
        };
        
        // Clear previous meanings
        meaningsContainer.innerHTML = '';
        
        // Show meanings (max 2 per part of speech)
        data.meanings.forEach(meaning => {
            const meaningDiv = document.createElement('div');
            meaningDiv.className = 'meaning';
            
            meaningDiv.innerHTML += `
                <p class="part-of-speech">${meaning.partOfSpeech}</p>
            `;
            
            meaning.definitions.slice(0, 2).forEach(def => {
                meaningDiv.innerHTML += `
                    <p class="definition">${def.definition}</p>
                    ${def.example ? `<p class="example">"${def.example}"</p>` : ''}
                `;
            });
            
            meaningsContainer.appendChild(meaningDiv);
        });
    }
    
    // Show error
    function showError(message) {
        meaningsContainer.innerHTML = `
            <div class="error-message">
                <p>${message}. Please try another word.</p>
            </div>
        `;
        
        // Reset after 2 seconds
        setTimeout(() => {
            meaningsContainer.innerHTML = `
                <div class="meaning">
                    <p class="part-of-speech">noun</p>
                    <p class="definition">A book or electronic resource that lists words with their meanings.</p>
                    <p class="example">"I checked the dictionary for that word's definition."</p>
                </div>
            `;
        }, 2000);
    }
    
    // Toggle dark mode
    function toggleTheme() {
        body.classList.toggle('dark-mode');
        localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
    }
    
    // Change font
    function changeFont() {
        const font = fontSelect.value;
        body.style.fontFamily = font;
        localStorage.setItem('font', font);
    }
});