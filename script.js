document.addEventListener('DOMContentLoaded', () => {
    const dogImage = document.getElementById('dog-image');
    const newDogButton = document.getElementById('new-dog-button');

    const getNewDog = async () => {
        try {
            const response = await fetch('https://random.dog/woof.json');
            const data = await response.json();
            dogImage.src = data.url;
        } catch (error) {
            console.error('Error fetching new dog:', error);
            // You could display an error message to the user here
        }
    };

    newDogButton.addEventListener('click', getNewDog);

    // Load an initial dog image
    getNewDog();
});