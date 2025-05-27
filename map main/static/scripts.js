let map;
let directionsService;
let directionsRenderer;
let trafficLayer;
let autocompleteStart;
let autocompleteEnd;
let markers = [];
let polylines = [];
let currentRoutes = [];

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 12.9716, lng: 77.5946 }, // Default center (Bengaluru, India)
        zoom: 12,
        styles: [
            { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
            { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
            { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
            { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
            { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
            { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#f8cdd6' }] },
            { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
            { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e3f2fd' }] }
        ]
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    trafficLayer = new google.maps.TrafficLayer();

    autocompleteStart = new google.maps.places.Autocomplete(document.getElementById('start'));
    autocompleteEnd = new google.maps.places.Autocomplete(document.getElementById('end'));
}

function calculateRoutes() {
    const start = document.getElementById('start').value;
    const end = document.getElementById('end').value;

    if (!start || !end) {
        alert('Please enter both start and end locations');
        return;
    }

    const request = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true
    };

    directionsService.route(request, function(result, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            displayRoutes(result);
        } else {
            alert('Failed to get routes: ' + status);
        }
    });
}

function displayRoutes(result) {
    const routes = result.routes;
    const routeList = document.getElementById('routeList');
    routeList.innerHTML = '';

    markers.forEach(marker => marker.setMap(null));
    markers = [];
    polylines.forEach(polyline => polyline.setMap(null));
    polylines = [];

    const startLocation = result.routes[0].legs[0].start_location;
    const endLocation = result.routes[0].legs[0].end_location;

    markers.push(new google.maps.Marker({
        position: startLocation,
        map: map,
        title: 'Start',
        icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
    }));

    markers.push(new google.maps.Marker({
        position: endLocation,
        map: map,
        title: 'End',
        icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
    }));

    routes.sort((a, b) => a.legs[0].duration.value - b.legs[0].duration.value);

    routes.forEach((route, index) => {
        const routeInfo = document.createElement('div');
        const routeDistance = route.legs[0].distance.text;
        const routeDuration = route.legs[0].duration.text;
        const trafficCondition = 'Fetching...'; 

        const optimalRoute = callAIModel(route);

        routeInfo.className = 'route-info';
        routeInfo.innerHTML = `
          <h3>Route ${index + 1} ${optimalRoute ? '<span style="color: #28a745;">(Optimal)</span>' : ''}</h3>
          <p>Distance: ${routeDistance}</p>
          <p>Duration: ${routeDuration}</p>
          <p>Traffic Condition: ${trafficCondition}</p>
        `;

        routeInfo.addEventListener('click', () => {
            showRoute(index);
        });

        routeList.appendChild(routeInfo);

        
        const polyline = new google.maps.Polyline({
            path: route.overview_path,
            strokeColor: getRouteColor(index),
            strokeOpacity: 0.7,
            strokeWeight: 5
        });
        polyline.setMap(map);
        polylines.push(polyline);
    });

    const bounds = new google.maps.LatLngBounds();
    routes.forEach(route => {
        route.overview_path.forEach(point => {
            bounds.extend(point);
        });
    });
    map.fitBounds(bounds);
}

function showRoute(routeIndex) {
    polylines.forEach(polyline => polyline.setMap(null));
    polylines[routeIndex].setMap(map);
}

function resetMap() {
    document.getElementById('start').value = '';
    document.getElementById('end').value = '';
    document.getElementById('routeList').innerHTML = '';
    markers.forEach(marker => marker.setMap(null));
    markers = [];
    polylines.forEach(polyline => polyline.setMap(null));
    polylines = [];
    map.setCenter({ lat: 12.9716, lng: 77.5946 });
    map.setZoom(12);
}

function refreshStatus() {
    alert('Status refreshed');
}

function changeMapType() {
    const mapType = document.getElementById('mapType').value;
    map.setMapTypeId(mapType);
}

function toggleTrafficLayer() {
    if (trafficLayer.getMap()) {
        trafficLayer.setMap(null);
    } else {
        trafficLayer.setMap(map);
    }
}

function zoomIn() {
    map.setZoom(map.getZoom() + 1);
}

function zoomOut() {
    map.setZoom(map.getZoom() - 1);
}

function getRouteColor(index) {
    const colors = ['#FF0000', '#00FF00', '#0000FF'];
    return colors[index % colors.length];
}

function callAIModel(route) {
    return Math.random() > 0.5;
}

// Global variables for map, directions service, directions renderer, etc.
/*let map;
let directionsService;
let directionsRenderer;
let trafficLayer;
let autocompleteStart;
let autocompleteEnd;
let markers = [];
let polylines = [];
let currentRoutes = [];

// Your WAQI API key
const waqiApiKey = '6829d65142bb0d7f48eed8b3e37d90f1d06db64b';

// Function to initialize the map
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 12.9716, lng: 77.5946 }, // Default center (Bengaluru, India)
        zoom: 12,
        styles: [
            { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
            { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
            { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
            { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
            { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
            { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#f8cdd6' }] },
            { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
            { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e3f2fd' }] }
        ]
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    trafficLayer = new google.maps.TrafficLayer();

    autocompleteStart = new google.maps.places.Autocomplete(document.getElementById('start'));
    autocompleteEnd = new google.maps.places.Autocomplete(document.getElementById('end'));
}

// Function to fetch AQI data using the WAQI API for a given location's coordinates
async function getAirQuality(lat, lon) {
    const url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${waqiApiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch AQI data');
        }
        const data = await response.json();
        if (data.status === 'ok' && data.data.aqi) {
            return data.data.aqi; // Return AQI value
        }
    } catch (error) {
        console.error('Error fetching AQI data:', error);
    }
    return null; // Return null if data is unavailable or error occurs
}

// Function to get a description based on the AQI value
function getAQIDescription(aqi) {
    if (aqi <= 50) return "Good (0-50)";
    if (aqi <= 100) return "Moderate (51-100)";
    if (aqi <= 150) return "Unhealthy for Sensitive Groups (101-150)";
    if (aqi <= 200) return "Unhealthy (151-200)";
    if (aqi <= 300) return "Very Unhealthy (201-300)";
    return "Hazardous (301+)";
}

// Function to calculate and display routes, and integrate AQI data
async function calculateRoutes() {
    const start = document.getElementById('start').value;
    const end = document.getElementById('end').value;

    if (!start || !end) {
        alert('Please enter both start and end locations');
        return;
    }

    const request = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true
    };

    directionsService.route(request, async function(result, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            displayRoutes(result);

            // Get coordinates for start and end locations
            const startCoords = result.routes[0].legs[0].start_location;
            const endCoords = result.routes[0].legs[0].end_location;

            // Fetch AQI for start and end locations
            const startAQI = await getAirQuality(startCoords.lat(), startCoords.lng());
            const endAQI = await getAirQuality(endCoords.lat(), endCoords.lng());

            // Update AQI display
            document.getElementById('aqi-start').textContent = `Start Location AQI: ${startAQI} (${getAQIDescription(startAQI)})`;
            document.getElementById('aqi-end').textContent = `End Location AQI: ${endAQI} (${getAQIDescription(endAQI)})`;
        } else {
            alert('Failed to get routes: ' + status);
        }
    });
}

// Function to display routes on the map
function displayRoutes(result) {
    const routes = result.routes;
    const routeList = document.getElementById('routeList');
    routeList.innerHTML = '';

    markers.forEach(marker => marker.setMap(null));
    markers = [];
    polylines.forEach(polyline => polyline.setMap(null));
    polylines = [];

    const startLocation = result.routes[0].legs[0].start_location;
    const endLocation = result.routes[0].legs[0].end_location;

    markers.push(new google.maps.Marker({
        position: startLocation,
        map: map,
        title: 'Start',
        icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
    }));

    markers.push(new google.maps.Marker({
        position: endLocation,
        map: map,
        title: 'End',
        icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
    }));

    routes.forEach((route, index) => {
        const polyline = new google.maps.Polyline({
            path: route.overview_path,
            strokeColor: getRouteColor(index),
            strokeOpacity: 0.7,
            strokeWeight: 5
        });
        polyline.setMap(map);
        polylines.push(polyline);
    });

    const bounds = new google.maps.LatLngBounds();
    routes.forEach(route => {
        route.overview_path.forEach(point => {
            bounds.extend(point);
        });
    });
    map.fitBounds(bounds);
}

// Utility function to get route color based on index
function getRouteColor(index) {
    const colors = ['#FF0000', '#00FF00', '#0000FF'];
    return colors[index % colors.length];
}*/
