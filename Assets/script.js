document
  .getElementById("search-btn")
  .addEventListener("click", getCityCoordinates);

function getCityCoordinates() {
  const cityInput = document.getElementById("cityInput").value;

  if (cityInput.trim() === "") {
    alert("Please enter a city name");
    return;
  }

  const apiKey = "ec61f504afb4422c8153335b70f3d289";
  const apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
    cityInput
  )}&key=${apiKey}`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      const results = data.results;
      if (results.length > 0) {
        const city = results[0].formatted;
        const latitude = results[0].geometry.lat;
        const longitude = results[0].geometry.lng;
        saveCityToLocalStorage(city, latitude, longitude);
        updateSearchHistoryUI();
        getWeatherData(latitude, longitude);
      } else {
        alert("No results found");
      }
    })
    .catch((error) => {
      alert("Something went wrong");
    });
}

function saveCityToLocalStorage(city, latitude, longitude) {
  const searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
  const isCityInHistory = searchHistory.some((entry) => entry.city === city);
  if (!isCityInHistory) {
    searchHistory.push({ city, latitude, longitude });
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  }
}

function updateSearchHistoryUI() {
  const searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

  const historyContainer = document.querySelector(".history");
  historyContainer.innerHTML = "";

  searchHistory.forEach((entry) => {
    const cityElement = document.createElement("div");
    cityElement.classList.add("city");
    cityElement.innerHTML = `<p>${entry.city.split(",")[0]}</p>`;
    historyContainer.appendChild(cityElement);
    cityElement.addEventListener("click", () => {
      getWeatherData(entry.latitude, entry.longitude);
    });
  });
}

function getWeatherData(latitude, longitude) {
  const weatherApiKey = "27cd1cc54f3c5103f47d3451c78fc8e2";
  const weatherApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}`;

  fetch(weatherApiUrl)
    .then((response) => response.json())
    .then((weatherData) => {
      console.log(weatherData);
      displayWeatherInfo(weatherData);
    })
    .catch((error) => {
      alert("Error fetching weather data");
    });
}

function displayWeatherInfo(weatherData) {
  const todayWeather = weatherData.list[0];
  const cityName = weatherData.city.name;

  document.getElementById("today-city").innerHTML = cityName;

  const todayTemperature = Math.round(
    kelvinToFahrenheit(todayWeather.main.temp)
  );
  document.getElementById("today-temperature").innerHTML = todayTemperature;

  const todayHumidity = todayWeather.main.humidity;
  document.getElementById("today-humidity").innerHTML = todayHumidity;

  const todayWindSpeed = todayWeather.wind.speed;
  document.getElementById("today-wind-speed").innerHTML = todayWindSpeed;

  const iconUrl = `http://openweathermap.org/img/w/${todayWeather.weather[0].icon}.png`;
  console.log(iconUrl);
  const iconElement = document.createElement("img");
  iconElement.src = iconUrl;
  document.getElementById("today-weather-icon").innerHTML = "";
  document.getElementById("today-weather-icon").appendChild(iconElement);

  const todayDate = getFormattedDate(todayWeather.dt_txt);
  document.getElementById("today-date").innerHTML = todayDate;

  const forecast1 = weatherData.list[8];
  const forecast2 = weatherData.list[16];
  const forecast3 = weatherData.list[24];
  const forecast4 = weatherData.list[32];

  displayForecast([forecast1, forecast2, forecast3, forecast4]);
}



function displayForecast(forecastData) {
  const daysContainer = document.querySelector(".forecast .days");

  daysContainer.innerHTML = "";

  forecastData.forEach((forecast, index) => {
    const dayElement = document.createElement("div");
    dayElement.classList.add("day");

    const forecastDate = getFormattedDate(forecast.dt_txt);
    const forecastIconUrl = `http://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;

    dayElement.innerHTML = `
            <h2 class="forecast-day">${forecastDate}</h2>
            <p class="icon"><img src="${forecastIconUrl}" alt="Weather Icon"></p>
            <p>Temp : <span id="forecast-temp-${index}">${Math.round(
      kelvinToFahrenheit(forecast.main.temp)
    )}</span> <span>°F</span></p>
    <p>Wind : <span id="forecast-wind-${index}">${
      forecast.wind.speed
    }</span> <span>MPH</span></p>

            <p>Humidity : <span id="forecast-humd-${index}">${
      forecast.main.humidity
    }</span> <span>%</span></p>
           
        `;

    daysContainer.appendChild(dayElement);
  });
}

function kelvinToFahrenheit(kelvin) {
  return ((kelvin - 273.15) * 9) / 5 + 32;
}

function getFormattedDate() {
  const currentDate = new Date();
  return `(${
    currentDate.getMonth() + 1
  }/${currentDate.getDate()}/${currentDate.getFullYear()})`;
}

function getFormattedDate(dtTxt) {
  const date = new Date(dtTxt);
  const options = { month: "numeric", day: "numeric", year: "numeric" };

  return `(${date.toLocaleDateString("en-US", options)})`;
}

function showFirstItemInLocalStorage() {
  const searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

  if (searchHistory.length > 0) {
    const firstItem = searchHistory[0];
    getWeatherData(firstItem.latitude, firstItem.longitude);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateSearchHistoryUI();
  showFirstItemInLocalStorage();
});
