let allReviews = [];

document.addEventListener('DOMContentLoaded', () => {
    const homeLink = document.getElementById('home-link');
    homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.classList.remove('hide-landing');
        displayAllReviews();
    });

    fetchReviews()
        .then(() => {
            updateDropdowns();
            displayAllReviews();
        })
        .catch(error => console.error('Error:', error));

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});

async function fetchReviews() {
    try {
        const response = await fetch('reviews/index.json');
        const reviewsMetadata = await response.json();
        allReviews = reviewsMetadata;
    } catch (error) {
        console.error('Error fetching reviews:', error);
    }
}

function updateDropdowns() {
    const cuisines = [...new Set(allReviews.map(review => review.cuisine))];
    const cities = [...new Set(allReviews.map(review => review.city))];

    populateDropdown('cuisine-dropdown', cuisines, 'cuisine');
    populateDropdown('city-dropdown', cities, 'city');
}

function populateDropdown(id, items, filterType) {
    const dropdown = document.getElementById(id);
    dropdown.innerHTML = ''; // Clear existing items
    items.forEach(item => {
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = item;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            displayFilteredReviews(filterType, item);
        });
        dropdown.appendChild(link);
    });
}

function displayAllReviews() {
    document.body.classList.remove('hide-landing');
    displayReviews(allReviews);
}

function displayFilteredReviews(filterType, filterValue) {
    document.body.classList.add('hide-landing');
    const filteredReviews = allReviews.filter(review => review[filterType] === filterValue);
    displayReviews(filteredReviews);
}

function displayReviews(reviews) {
    const container = document.getElementById('reviews-container');
    container.innerHTML = '';
    reviews.forEach(review => {
        const reviewElement = createReviewElement(review);
        container.appendChild(reviewElement);
    });
}

function createReviewElement(review) {
    const article = document.createElement('article');
    article.classList.add('review');
    article.innerHTML = `
        <h2>${review.title}</h2>
        <p class="review-meta">By ${review.author} | ${formatDate(review.date)}</p>
        <div class="star-rating">${createStarRating(review.rating)}</div>
        <p><strong>Cuisine:</strong> ${review.cuisine}</p>
        <p><strong>Location:</strong> ${review.city}</p>
        <div class="tags">
            ${review.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <img src="images/${review.image}" alt="${review.title}" class="review-image" loading="lazy">
        <button class="load-review" data-id="${review.id}">Read Full Review</button>
        <div class="review-content" id="review-content-${review.id}"></div>
    `;
    article.querySelector('.load-review').addEventListener('click', () => loadFullReview(review.id));
    return article;
}

function createStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return `${'<span class="star full-star">★</span>'.repeat(fullStars)}${halfStar ? '<span class="star half-star">★</span>' : ''}${'<span class="star empty-star">☆</span>'.repeat(emptyStars)}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

async function loadFullReview(id) {
    const reviewContentElement = document.getElementById(`review-content-${id}`);
    const loadButton = reviewContentElement.previousElementSibling;

    if (reviewContentElement.innerHTML === '') {
        try {
            loadButton.textContent = 'Loading...';
            loadButton.disabled = true;

            const contentResponse = await fetch(`reviews/${id}.md`);
            const content = await contentResponse.text();
            const review = allReviews.find(review => review.id === id);

            // Extract images for the carousel
            const carouselImages = extractCarouselImages(content);

            const fullReviewOverlay = document.createElement('div');
            fullReviewOverlay.classList.add('full-review');

            fullReviewOverlay.innerHTML = `
                <div class="review-header" style="background-image: url('images/${review.image}')">
                    <h2>${review.title}</h2>
                    <div class="star-rating">${createStarRating(review.rating)}</div>
                    <p class="review-meta">By ${review.author} | ${formatDate(review.date)}</p>
                </div>
                <button class="close-review">Close</button>
                <div class="review-content">${marked.parse(content)}</div>
                ${carouselImages.length ? createCarouselHTML(carouselImages) : ''}
            `;

            fullReviewOverlay.querySelector('.close-review').addEventListener('click', () => {
                document.body.removeChild(fullReviewOverlay);
            });

            document.body.appendChild(fullReviewOverlay);
            loadButton.textContent = 'Hide Full Review';
        } catch (error) {
            console.error('Error loading full review:', error);
            reviewContentElement.innerHTML = '<p>Error loading review. Please try again later.</p>';
        } finally {
            loadButton.disabled = false;
        }
    } else {
        reviewContentElement.innerHTML = '';
        loadButton.textContent = 'Read Full Review';
    }
}




// function extractCarouselImages(content) {
//     const regex = /!\[.*?\]\((.*?)\)/g;
//     let matches;
//     const imagePaths = [];
//     while ((matches = regex.exec(content)) !== null) {
//         imagePaths.push(matches[1]);
//     }
//     return imagePaths;
// }

function extractCarouselImages(content) {
    // const regex = /!$$$.*?$$$$$(.*?)$$/g;
    const regex = /!\[.*?\]\((.*?)\)/g;
    let matches;
    const imagePaths = [];
    while ((matches = regex.exec(content)) !== null) {
        console.log("Extracted image path:", matches[1]); // Debug log
        imagePaths.push(matches[1]);
    }
    return imagePaths;
}


function createCarouselHTML(imagePaths) {
    return `
        <div class="carousel">
            ${imagePaths.map(path => `<img src="${path}" alt="Review Image">`).join('')}
        </div>
    `;
}



// function createCarouselHTML(imagePaths) {
//     return `
//         <div class="carousel">
//             ${imagePaths.map(path => `<img src="${path}" alt="Review Image">`).join('')}
//         </div>
//     `;
// }
