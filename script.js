const map = document.getElementById('map');
const pointNameInput = document.getElementById('point-name');
const saveBtn = document.getElementById('save-btn');
const messageBox = document.getElementById('message');

const savedPoints = JSON.parse(localStorage.getItem('mirage_points')) || [];
savedPoints.forEach(({x, y, name}) => addMarker(x, y, name));

let markers = [];

map.addEventListener('click', (event) => {
    const rect = map.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const marker = addMarker(x, y, "");
    markers.push({ x, y, marker });
});

saveBtn.addEventListener('click', () => {
    const name = pointNameInput.value.trim();
    if (markers.length === 0 || !name) {
        messageBox.textContent = "Пожалуйста, выберите точку и введите название.";
        return;
    }

    markers.forEach(({ x, y, marker }) => {
        marker.dataset.name = name;
        savedPoints.push({ x, y, name });
        localStorage.setItem('mirage_points', JSON.stringify(savedPoints));
    });

    sendPointToBot(name);

    messageBox.textContent = "Вы успешно сохранили точку, возвращайтесь в бот, чтобы завершить...";
    pointNameInput.value = "";
    markers = [];
});

function addMarker(x, y, name) {
    const marker = document.createElement('div');
    marker.classList.add('marker');
    marker.style.left = `${x}px`;
    marker.style.top = `${y}px`;
    marker.dataset.name = name;
    map.parentNode.appendChild(marker);

    marker.addEventListener('mouseenter', () => showTooltip(marker));
    marker.addEventListener('mouseleave', hideTooltip);
    marker.addEventListener('click', (event) => {
        event.stopPropagation();
        showEditDeleteOptions(marker);
    });

    return marker;
}

function showTooltip(marker) {
    const tooltip = document.createElement('div');
    tooltip.classList.add('tooltip');
    tooltip.textContent = marker.dataset.name || "Без названия";
    document.body.appendChild(tooltip);

    const rect = marker.getBoundingClientRect();
    tooltip.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
    tooltip.style.top = `${rect.top + window.scrollY - 25}px`;

    marker._tooltip = tooltip;
}

function hideTooltip() {
    if (document.querySelector('.tooltip')) {
        document.querySelector('.tooltip').remove();
    }
}

function showEditDeleteOptions(marker) {
    if (document.querySelector('.options')) {
        document.querySelector('.options').remove();
    }

    const options = document.createElement('div');
    options.classList.add('options');

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Изменить название';
    editBtn.addEventListener('click', () => {
        const newName = prompt('Введите новое название:', marker.dataset.name);
        if (newName) {
            marker.dataset.name = newName;
            updateMarkerData(marker, newName);
        }
    });
    options.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Удалить точку';
    deleteBtn.addEventListener('click', () => {
        marker.remove();
        removeMarkerData(marker);
        options.remove();
    });
    options.appendChild(deleteBtn);

    document.body.appendChild(options);

    const rect = marker.getBoundingClientRect();
    options.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
    options.style.top = `${rect.top + window.scrollY + 20}px`;

    document.addEventListener('click', function hideOptions(event) {
        if (!options.contains(event.target) && event.target !== marker) {
            options.remove();
            document.removeEventListener('click', hideOptions);
        }
    });
}

function updateMarkerData(marker, newName) {
    const index = savedPoints.findIndex(
        point => point.x === parseFloat(marker.style.left) && point.y === parseFloat(marker.style.top)
    );
    if (index !== -1) {
        savedPoints[index].name = newName;
        localStorage.setItem('mirage_points', JSON.stringify(savedPoints));
    }
}

function removeMarkerData(marker) {
    const index = savedPoints.findIndex(
        point => point.x === parseFloat(marker.style.left) && point.y === parseFloat(marker.style.top)
    );
    if (index !== -1) {
        savedPoints.splice(index, 1);
        localStorage.setItem('mirage_points', JSON.stringify(savedPoints));
    }
}

function sendPointToBot(name) {
    // Пример запроса в бота
}
