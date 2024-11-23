// Spotify API credentials
const clientId = "a0db015f808f4095b36934136b6900b7";
const clientSecret = "57ea7fc5edae4a478a3fce8b66f3733e";
//Put your own credentials here


// The Document Object Model  Elements
// Programming interface for web dev.

const genreSelect = document.getElementById("genre");
const yearSelect = document.getElementById("year");
const searchInput = document.getElementById("search");
const searchButton = document.getElementById("searchButton");
const resultsTable = document.getElementById("resultsTable");

// Get Spotify Access Token - from the documentation of spotify for developers page
// https://developer.spotify.com/documentation/web-api/reference

async function getAccessToken() {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(clientId + ":" + clientSecret)}`,
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  return data.access_token;
}

// Fetch Data from Spotify
async function fetchSpotifyData(query, genre = "", year = new Date().getFullYear()) {
  try {
    const accessToken = await getAccessToken();

    let url = `https://api.spotify.com/v1/search?q=${query}`;
    if (genre) url += `+genre:${genre}`;
    if (year) url += `+year:${year}`;
    url += `&type=track&limit=10`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    return data.tracks.items;
  } catch (error) {
    console.error("Error fetching Spotify data:", error);
  }
}

// Formating it in table format
function renderResults(tracks) {
  resultsTable.innerHTML = ""; 

  if (!tracks || tracks.length === 0) {
    resultsTable.innerHTML = "<tr><td colspan='4'>No results found</td></tr>";
    return;
  }

  tracks.forEach((track) => {
    const row = document.createElement("tr");

    const titleCell = document.createElement("td");
    const titleLink = document.createElement("a");
    titleLink.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(track.name + " " + track.artists[0].name)}`;
    titleLink.target = "_blank";
    titleLink.textContent = track.name;
    titleCell.appendChild(titleLink);

    const artistCell = document.createElement("td");
    artistCell.textContent = track.artists.map((artist) => artist.name).join(", ");

    const albumCell = document.createElement("td");
    albumCell.textContent = track.album.name;

    const yearCell = document.createElement("td");
    const releaseYear = new Date(track.album.release_date).getFullYear();
    yearCell.textContent = releaseYear;

    row.appendChild(titleCell);
    row.appendChild(artistCell);
    row.appendChild(albumCell);
    row.appendChild(yearCell);

    resultsTable.appendChild(row);
  });
}

// Genre Change
genreSelect.addEventListener("change", async () => {
  const genre = genreSelect.value;
  const year = yearSelect.value || new Date().getFullYear();
  const tracks = await fetchSpotifyData("", genre, year);
  renderResults(tracks);
});

// Search Button Click
searchButton.addEventListener("click", async () => {
  const query = searchInput.value;
  const genre = genreSelect.value;
  const year = yearSelect.value || new Date().getFullYear();
  const searchType = document.querySelector('input[name="searchType"]:checked').value;

  let searchQuery = query;
  if (searchType === "artist") {
    searchQuery = `artist:${query}`;
  } else if (searchType === "album") {
    searchQuery = `album:${query}`;
  }

  const tracks = await fetchSpotifyData(searchQuery, genre, year);
  renderResults(tracks);
});

// Default Fetch (Top Songs of Current Year on Load)
document.addEventListener("DOMContentLoaded", async () => {
  const year = new Date().getFullYear();
  const tracks = await fetchSpotifyData("", "", year);
  renderResults(tracks);
});
