import './style.css'

const dogImage = document.getElementById('dog-image');
const optionsContainer = document.getElementById('options');
const result = document.getElementById('result');
const nextDogBtn = document.getElementById('next-dog-btn');

let correctBreed = "";

async function getRandomDog() {
  // Reset content
  result.textContent = "";
  optionsContainer.innerHTML = "Loading...";
  let imageURL = "";

  // Make API call
  try {
    const response = await fetch("https://dog.ceo/api/breeds/image/random");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    imageURL = data.message;
    console.log(data);  
  } catch (err) {
    console.error("Error fetching data:", err);
  }

  // Set new image
  if (dogImage) {
    dogImage.src = imageURL;
  } else {
    console.error("Error: dogImage element not found!");
    return;
  }


  // Extract breed form URL
  correctBreed = getBreedFromURL(imageURL)

  // Fetch other breeds and render options
  await fetchBreedOptions(correctBreed);
}

function getBreedFromURL(url) {
  // Break url into portions
  const portions = url.split("/");

  // Get the breed
  const breed = portions[portions.indexOf("breeds") + 1];

  // Handle multiple breeds
  if (breed.includes("-")) {
    return breed.split("-")[0];
  }

  return breed;
}

async function fetchBreedOptions(correctBreed) {
  let allBreeds = [];

  // Fetch other breeds
  try {
    const response = await fetch("https://dog.ceo/api/breeds/list/all");
    const data = await response.json();
    allBreeds = Object.keys(data.message);
    console.log(data);
  } catch (err) {
    console.error("Error fetching data:", err);
  }

  // Get breeds
  const options = new Set([correctBreed]);
  while (options.size < 4) {
    const randomBreed = allBreeds[Math.floor(Math.random() * allBreeds.length)];
    options.add(randomBreed);
  }

  // Render options
  displayOptions()
} 

function displayOptions(options) {
  // Reset options container and shuffle breed options
  optionsContainer.innerHTML = "";
  options.sort(() => Math.random() - 0.5);

  // Create and define a button for each breed
  options.forEach(breed => {
    const button = document.createElement("button");
    button.textContent = breed;
    button.onclick = () => checkAnswer(breed); // Run answer checker on click
    optionsContainer.appendChild(button);
  });
}

function checkAnswer(chosenBreed) {
  if (chosenBreed === correctBreed) {
    result.textContent = "🎉 Correct!";
    result.style.color = "green";
  } else {
    result.textContent = "❌ Try again!";
    result.style.color = "red";
  }
}

// Load new dog when "Next Dog" button is clicked
nextDogBtn.addEventListener("click", getRandomDog);

// Load a random dog on page load
getRandomDog();