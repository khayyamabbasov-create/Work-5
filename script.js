// функция для отрисовки звёзд
function renderStars(rating) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars += "⭐";
    } else if (rating >= i - 0.5) {
      stars += "✩";
    } else {
      stars += "☆";
    }
  }
  return stars;
}

let workersData = [];

async function loadWorkers() {
  const response = await fetch("workers.json");
  workersData = await response.json();

  const stored = JSON.parse(localStorage.getItem("workers")) || [];
  workersData = workersData.concat(stored);

  renderWorkers(workersData);
  initFilters();
}

function renderWorkers(workers) {
  const list = document.getElementById("workerList");
  list.innerHTML = "";

  const map = L.map('map').setView([40.4, 49.8], 9);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  workers.forEach(worker => {
    const marker = L.marker([worker.lat, worker.lng]).addTo(map);
    marker.bindPopup(`<b>${worker.name}</b><br>${worker.category} - ${worker.subcategory}<br>${worker.price}₼/час`);

    const col = document.createElement("div");
    col.className = "col-md-3 mb-4";
    col.innerHTML = `
      <div class="card h-100">
        <img src="${worker.photo}" class="card-img-top" alt="${worker.name}">
        <div class="card-body">
          <p class="price">${worker.price}₼/час</p>
          <h5 class="card-title">
            <a href="profile.html?id=${worker.id}" class="text-decoration-none">${worker.name}</a>
          </h5>
          <p class="text-muted">${worker.category} • ${worker.subcategory} • ${worker.city}</p>
          <p class="mb-1"><b>Рейтинг:</b> ${renderStars(worker.rating)} (${worker.reviews})</p>
          <a href="profile.html?id=${worker.id}" class="btn btn-sm btn-danger w-100 mt-2">Подробнее</a>
        </div>
      </div>
    `;
    list.appendChild(col);
  });
}

function initFilters() {
  document.getElementById("search").addEventListener("input", function(e) {
    const query = e.target.value.toLowerCase();
    const filtered = workersData.filter(w =>
      w.name.toLowerCase().includes(query) ||
      w.category.toLowerCase().includes(query) ||
      w.subcategory.toLowerCase().includes(query) ||
      w.city.toLowerCase().includes(query)
    );
    renderWorkers(filtered);
  });

  document.querySelectorAll(".category-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const category = btn.getAttribute("data-category");

      if (category === "all") {
        renderWorkers(workersData);
        document.getElementById("subcategoryContainer").innerHTML = "";
        return;
      }

      const subcategories = [...new Set(workersData
        .filter(w => w.category === category)
        .map(w => w.subcategory))];

      const subContainer = document.getElementById("subcategoryContainer");
      subContainer.innerHTML = "";
      subcategories.forEach(sub => {
        const button = document.createElement("button");
        button.className = "btn btn-outline-primary me-2";
        button.innerText = sub;
        button.addEventListener("click", () => {
          const filtered = workersData.filter(w => w.subcategory === sub);
          renderWorkers(filtered);
        });
        subContainer.appendChild(button);
      });

      const filtered = workersData.filter(w => w.category === category);
      renderWorkers(filtered);
    });
  });

  document.getElementById("sort").addEventListener("change", function(e) {
    let sorted = [...workersData];
    if (e.target.value === "price_asc") {
      sorted.sort((a, b) => parseInt(a.price) - parseInt(b.price));
    } else if (e.target.value === "price_desc") {
      sorted.sort((a, b) => parseInt(b.price) - parseInt(a.price));
    } else if (e.target.value === "rating") {
      sorted.sort((a, b) => b.rating - a.rating);
    }
    renderWorkers(sorted);
  });
}

loadWorkers();