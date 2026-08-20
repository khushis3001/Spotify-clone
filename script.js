const audio = document.getElementById("audio");

const playBtn = document.getElementById("playBtn");
const previousBtn = document.getElementById("previousBtn");
const nextBtn = document.getElementById("nextBtn");

const progress = document.getElementById("progress");
const volume = document.getElementById("volume");

const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");

const playerTitle = document.getElementById("playerTitle");
const playerArtist = document.getElementById("playerArtist");
const playerImage = document.getElementById("playerImage");

const likeBtn = document.getElementById("likeBtn");

const homeSection = document.getElementById("homeSection");
const searchSection = document.getElementById("searchSection");
const librarySection = document.getElementById("librarySection");

const homeBtn = document.getElementById("homeBtn");
const searchBtn = document.getElementById("searchBtn");
const libraryBtn = document.getElementById("libraryBtn");

const searchInput = document.getElementById("bigSearchInput");
const searchResults = document.getElementById("searchResults");

const topSearchInput =
    document.getElementById("searchInput");


/* ================= BACKEND URL ================= */

const API_URL = "http://localhost:5000";


/* ================= SONGS ================= */

// IMPORTANT:
// We are no longer hard-coding the songs here.
// MongoDB will provide them.

let songs = [];

let currentSong = 0;
let isPlaying = false;


/* ================= LOAD SONGS FROM BACKEND ================= */

async function loadSongsFromBackend() {

    try {

        const response =
            await fetch(`${API_URL}/api/songs`);

        if (!response.ok) {
            throw new Error("Could not fetch songs");
        }

        songs = await response.json();

        console.log("Songs loaded from MongoDB:", songs);


        if (songs.length > 0) {

            loadSong(0);

        } else {

            console.log("No songs found in database.");

        }

    } catch (error) {

        console.error(
            "Error loading songs:",
            error
        );

    }

}


/* ================= LOAD SONG ================= */

function loadSong(index) {

    if (songs.length === 0) {
        return;
    }

    currentSong = index;

    const song = songs[index];

    playerTitle.textContent = song.title;

    playerArtist.textContent = song.artist;

    playerImage.src = song.image;

    /*
       MongoDB gives:

       /songs/song1.mp3

       Backend runs on:

       http://localhost:5000

       So we create:

       http://localhost:5000/songs/song1.mp3
    */

    audio.src = API_URL + song.audio;

    progress.value = 0;

}


/* ================= PLAY SONG ================= */

function playSong() {

    if (!audio.src) {
        return;
    }

    audio.play()
        .then(() => {

            isPlaying = true;

            playBtn.textContent = "❚❚";

        })
        .catch(error => {

            console.error(
                "Playback error:",
                error
            );

        });

}


/* ================= PAUSE SONG ================= */

function pauseSong() {

    audio.pause();

    isPlaying = false;

    playBtn.textContent = "▶";

}


/* ================= PLAY / PAUSE ================= */

playBtn.addEventListener("click", () => {

    if (isPlaying) {

        pauseSong();

    } else {

        playSong();

    }

});


/* ================= SONG CARDS ================= */

document.querySelectorAll(".song-card").forEach(card => {

    card.addEventListener("click", function () {

        const title = this.dataset.title;

        const index = songs.findIndex(
            song => song.title === title
        );

        if (index !== -1) {

            loadSong(index);

            playSong();

        } else {

            console.log(
                "Song not found in MongoDB:",
                title
            );

        }

    });

});


/* ================= NEXT ================= */

nextBtn.addEventListener("click", () => {

    if (songs.length === 0) {
        return;
    }

    currentSong++;

    if (currentSong >= songs.length) {

        currentSong = 0;

    }

    loadSong(currentSong);

    playSong();

});


/* ================= PREVIOUS ================= */

previousBtn.addEventListener("click", () => {

    if (songs.length === 0) {
        return;
    }

    currentSong--;

    if (currentSong < 0) {

        currentSong = songs.length - 1;

    }

    loadSong(currentSong);

    playSong();

});


/* ================= AUDIO ENDS ================= */

audio.addEventListener("ended", () => {

    if (songs.length === 0) {
        return;
    }

    currentSong++;

    if (currentSong >= songs.length) {

        currentSong = 0;

    }

    loadSong(currentSong);

    playSong();

});


/* ================= PROGRESS ================= */

audio.addEventListener("timeupdate", () => {

    if (!audio.duration) {
        return;
    }

    const percentage =
        (audio.currentTime / audio.duration) * 100;

    progress.value = percentage;

    currentTime.textContent =
        formatTime(audio.currentTime);

    duration.textContent =
        formatTime(audio.duration);

});


progress.addEventListener("input", () => {

    if (!audio.duration) {
        return;
    }

    audio.currentTime =
        (progress.value / 100) * audio.duration;

});


function formatTime(time) {

    if (isNaN(time)) {

        return "0:00";

    }

    const minutes =
        Math.floor(time / 60);

    const seconds =
        Math.floor(time % 60)
            .toString()
            .padStart(2, "0");

    return `${minutes}:${seconds}`;

}


/* ================= VOLUME ================= */

volume.addEventListener("input", () => {

    audio.volume = volume.value;

});

audio.volume = 0.7;


/* ================= LIKE ================= */

likeBtn.addEventListener("click", () => {

    if (likeBtn.textContent === "♡") {

        likeBtn.textContent = "♥";

    } else {

        likeBtn.textContent = "♡";

    }

});


/* ================= NAVIGATION ================= */

function showSection(section) {

    homeSection.style.display = "none";

    searchSection.style.display = "none";

    librarySection.style.display = "none";

    section.style.display = "block";

}


function clearActive() {

    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.classList.remove("active");

        });

}


homeBtn.addEventListener("click", (e) => {

    e.preventDefault();

    showSection(homeSection);

    clearActive();

    homeBtn.classList.add("active");

});


searchBtn.addEventListener("click", (e) => {

    e.preventDefault();

    showSection(searchSection);

    clearActive();

    searchBtn.classList.add("active");

    searchInput.focus();

});


libraryBtn.addEventListener("click", (e) => {

    e.preventDefault();

    showSection(librarySection);

    clearActive();

    libraryBtn.classList.add("active");

});


/* ================= TOP SEARCH ================= */

topSearchInput.addEventListener("focus", () => {

    showSection(searchSection);

    clearActive();

    searchBtn.classList.add("active");

});


/* ================= SEARCH ================= */

searchInput.addEventListener(
    "input",
    searchSongs
);


function searchSongs() {

    const value =
        searchInput.value
            .toLowerCase()
            .trim();

    searchResults.innerHTML = "";

    if (value === "") {

        return;

    }


    const filtered =
        songs.filter(song =>

            song.title
                .toLowerCase()
                .includes(value)

            ||

            song.artist
                .toLowerCase()
                .includes(value)

        );


    if (filtered.length === 0) {

        searchResults.innerHTML =
            "<p style='margin-top:30px;color:#aaa'>No results found.</p>";

        return;

    }


    filtered.forEach(song => {

        const index =
            songs.indexOf(song);

        const result =
            document.createElement("div");

        result.className =
            "search-result";

        result.innerHTML = `

            <img src="${song.image}">

            <div>

                <h3>${song.title}</h3>

                <p style="color:#aaa;margin-top:5px">

                    ${song.artist}

                </p>

            </div>

        `;


        result.addEventListener("click", () => {

            loadSong(index);

            playSong();

        });


        searchResults.appendChild(result);

    });

}


/* ================= HERO PLAY ================= */

document
    .getElementById("heroPlay")
    .addEventListener("click", () => {

        if (songs.length === 0) {
            return;
        }

        loadSong(0);

        playSong();

    });


/* ================= START APPLICATION ================= */

// Get songs from MongoDB

loadSongsFromBackend();