import './style.css'

const dogImage = document.getElementById('dog-image');
const optionsContainer = document.getElementById('options');
const result = document.getElementById('result');
const nextDogBtn = document.getElementById('next-dog-btn');
const breedSelect = document.getElementById('breed-select');
const galleryContainer = document.getElementById('gallery-container');
const navButtons = document.querySelectorAll('.nav-btn');

let correctBreed = "";
let allBreeds = [];

// API Functions
async function fetchWithErrorHandling(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error(`Error fetching ${url}:`, err);
    throw err;
  }
}

async function getAllBreeds() {
  const data = await fetchWithErrorHandling("https://dog.ceo/api/breeds/list/all");
  return Object.keys(data.message);
}

async function getRandomDog() {
  try {
    // Reset content and show loading state
    result.textContent = "";
    optionsContainer.innerHTML = "<p>Loading...</p>";
    dogImage.src = "";
    dogImage.alt = "Loading...";

    // Fetch random dog image
    const data = await fetchWithErrorHandling("https://dog.ceo/api/breeds/image/random");
    const imageURL = data.message;

    // Update image and get breed options
    dogImage.src = imageURL;
    dogImage.alt = "Random Dog";
    correctBreed = getBreedFromURL(imageURL);
    await displayBreedOptions(correctBreed);

  } catch (err) {
    optionsContainer.innerHTML = `<p class="error">Failed to load dog image. Please try again.</p>`;
    result.textContent = "";
  }
}

async function getBreedImages(breed, limit = 8) {
  const data = await fetchWithErrorHandling(`https://dog.ceo/api/breed/${breed}/images`);
  return data.message.slice(0, limit);
}

// Helper Functions
function getBreedFromURL(url) {
  const portions = url.split("/");
  const breed = portions[portions.indexOf("breeds") + 1];
  return breed.includes("-") ? breed.split("-")[0] : breed;
}

async function displayBreedOptions(correctBreed) {
  try {
    if (!allBreeds.length) {
      allBreeds = await getAllBreeds();
    }

    const options = new Set([correctBreed]);
    while (options.size < 4) {
      const randomBreed = allBreeds[Math.floor(Math.random() * allBreeds.length)];
      options.add(randomBreed);
    }

    displayOptions(Array.from(options));
  } catch (err) {
    optionsContainer.innerHTML = `<p class="error">Failed to load breed options. Please try again.</p>`;
  }
}

function displayOptions(options) {
  optionsContainer.innerHTML = "";
  options.sort(() => Math.random() - 0.5);

  options.forEach(breed => {
    const button = document.createElement("button");
    button.textContent = breed;
    button.onclick = () => checkAnswer(breed);
    optionsContainer.appendChild(button);
  });
}

function checkAnswer(chosenBreed) {
  const isCorrect = chosenBreed === correctBreed;
  
  // Set result text
  result.textContent = isCorrect 
    ? "🎉 Correct!" 
    : `❌ Wrong! The correct breed was ${correctBreed}`;
  
  // Get all buttons
  const buttons = optionsContainer.querySelectorAll('button');
  
  // Change button colors and disable all buttons
  buttons.forEach(btn => {
    // Disable the button
    btn.disabled = true;
    
    if (btn.textContent === chosenBreed) {
      // Change color of selected button based on correctness
      btn.style.backgroundColor = isCorrect ? '#28a745' : '#dc3545';
      btn.style.color = 'white';
    } else if (btn.textContent === correctBreed && !isCorrect) {
      // Highlight the correct answer if user selected wrong
      btn.style.borderColor = '#28a745';
      btn.style.borderWidth = '3px';
    }
  });
}

async function initializeBreedSelect() {
  try {
    if (!allBreeds.length) {
      allBreeds = await getAllBreeds();
    }

    breedSelect.innerHTML = `
      <option value="">Select a breed...</option>
      ${allBreeds.map(breed => `<option value="${breed}">${breed}</option>`).join('')}
    `;
  } catch (err) {
    breedSelect.innerHTML = `<option value="">Error loading breeds</option>`;
  }
}

async function displayBreedGallery(breed) {
  try {
    galleryContainer.innerHTML = '<p>Loading...</p>';
    const images = await getBreedImages(breed);
    
    galleryContainer.innerHTML = images.map(url => `
      <div class="gallery-item">
        <img src="${url}" alt="${breed} dog" loading="lazy">
      </div>
    `).join('');
  } catch (err) {
    galleryContainer.innerHTML = `<p class="error">Failed to load images for ${breed}. Please try again.</p>`;
  }
}

// Navigation
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.toggle('active', page.id === pageId);
  });

  navButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === pageId.replace('-page', ''));
  });
}

// Event Listeners
nextDogBtn.addEventListener("click", getRandomDog);

breedSelect.addEventListener('change', (e) => {
  if (e.target.value) {
    displayBreedGallery(e.target.value);
  } else {
    galleryContainer.innerHTML = '';
  }
});

navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const pageId = `${btn.dataset.page}-page`;
    showPage(pageId);

    // Initialize page content if needed
    if (pageId === 'gallery-page' && !breedSelect.options.length) {
      initializeBreedSelect();
    } else if (pageId === 'game-page' && !dogImage.src) {
      getRandomDog();
    }
  });
});

// Initialize app
getRandomDog();
initializeBreedSelect(); // Initialize breed select dropdown on page load