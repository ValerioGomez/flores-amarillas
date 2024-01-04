// Sincronizar las letras con la canción
var audio = document.querySelector("audio");
var lyrics = document.querySelector("#lyrics");
var subtituloElement = document.getElementById("subtitulo");
// Array de objetos que contiene cada línea y su tiempo de aparición en segundos
var lyricsData = [
  { text: "Para ti 😁🌼", time: 2 },
  { text: "Viene mas .. ⛈️", time: 4 },
  { text: "Usa paragua ... 🌦️", time: 6 },
  { text: "At the time", time: 15 },
  { text: "The whisper of birds", time: 18 },
  { text: "Lonely before the sun cried", time: 27 },
  { text: "Fell from the sky", time: 32 },
  { text: "Like water drops", time: 33 },
  { text: "Where I'm now? I don't know why", time: 41 },
  { text: "Nice butterflies in my hands", time: 47 },
  { text: "Too much light for twilight", time: 54 },
  { text: "In the mood for the flowers love", time: 59 },
  { text: "That vision", time: 67 },
  { text: "Really strong, blew my mind", time: 72 },
  { text: "Silence Let me see what it was", time: 78 },
  { text: "I only want to live in clouds", time: 83 },
  { text: "Where I'm now? I don't know why", time: 91 },
  { text: "Nice butterflies in my hands", time: 97 },
  { text: "Too much light for twilight", time: 104 },
  { text: "In the mood for the flowers love", time: 108 },
  { text: "At the time", time: 144 },
  { text: "The whisper of birds", time: 148 },
  { text: "Lonely before the sun cried", time: 153 },
  { text: "Fell from the sky", time: 158 },
  { text: "Like water drops", time: 164 },
  { text: "Where I'm now? I don't know why", time: 169 },
  { text: "Nice butterflies in my hands", time: 176 },
  { text: "Too much light for twilight", time: 183 },
  { text: "In the mood for the flowers", time: 188 },
  { text: "Love.", time: 197 },
];

var subtitulo = [
  { text: "Luego de la lluvia .. 🌧️", time: 3 },
  { text: "Pero de todas maneras ... 🌦️", time: 5 },
  { text: "Y cuando lo hagas ... ☔", time: 7 },
  { text: "Sale el Sol ... 🌞", time: 8 },
  { text: "En aquel momento", time: 15 },
  { text: "El susurro de los pájaros", time: 18 },
  { text: "Solitario antes de que el sol llorara", time: 27 },
  { text: "Cayó del cielo", time: 32 },
  { text: "Como gotas de agua", time: 33 },
  { text: "¿Dónde estoy ahora? No sé por qué", time: 41 },
  { text: "Bonitas mariposas en mis manos", time: 47 },
  { text: "Demasiada luz para el crepúsculo", time: 54 },
  { text: "En el estado de ánimo del amor de las flores", time: 59 },
  { text: "Esa visión", time: 67 },
  { text: "Realmente fuerte, voló mi mente", time: 72 },
  { text: "Silencio, déjame ver lo que fue", time: 78 },
  { text: "Solo quiero vivir entre las nubes", time: 83 },
  { text: "¿Dónde estoy ahora? No sé por qué", time: 91 },
  { text: "Bonitas mariposas en mis manos", time: 97 },
  { text: "Demasiada luz para el crepúsculo", time: 104 },
  { text: "En el estado de ánimo del amor de las flores", time: 108 },
  { text: "En aquel momento", time: 144 },
  { text: "El susurro de los pájaros", time: 148 },
  { text: "Solitario antes de que el sol llorara", time: 153 },
  { text: "Cayó del cielo", time: 158 },
  { text: "Como gotas de agua", time: 164 },
  { text: "¿Dónde estoy ahora? No sé por qué", time: 169 },
  { text: "Bonitas mariposas en mis manos", time: 176 },
  { text: "Demasiada luz para el crepúsculo", time: 183 },
  { text: "En el estado de ánimo de las flores", time: 188 },
  { text: "Amor.", time: 197 },
];

// Animar las letras
function updateLyrics() {
  var time = Math.floor(audio.currentTime);
  var currentLine = lyricsData.find(
    (line) => time >= line.time && time < line.time + 6
  );
  var currentSubtitle = subtitulo.find(
    (line) => time >= line.time && time < line.time + 6
  );

  if (currentLine) {
    var fadeInDuration = 0.1;
    var opacity = Math.min(1, (time - currentLine.time) / fadeInDuration);

    lyrics.style.opacity = opacity;
    lyrics.innerHTML = currentLine.text;
  } else {
    lyrics.style.opacity = 0;
    lyrics.innerHTML = "";
  }

  if (currentSubtitle) {
    var fadeInDurationSub = 0.1;
    var opacitySub = Math.min(
      1,
      (time - currentSubtitle.time) / fadeInDurationSub
    );

    subtituloElement.style.opacity = opacitySub;
    subtituloElement.innerHTML = currentSubtitle.text;
  } else {
    subtituloElement.style.opacity = 0;
    subtituloElement.innerHTML = "";
  }
}

setInterval(updateLyrics, 1000);

//funcion titulo
// Función para ocultar el título después de 216 segundos
function ocultarTitulo() {
  var titulo = document.querySelector(".titulo");
  titulo.style.animation =
    "fadeOut 3s ease-in-out forwards"; /* Duración y función de temporización de la desaparición */
  setTimeout(function () {
    titulo.style.display = "none";
  }, 3000); // Espera 3 segundos antes de ocultar completamente
}

// Llama a la función después de 216 segundos (216,000 milisegundos)
setTimeout(ocultarTitulo, 216000);
