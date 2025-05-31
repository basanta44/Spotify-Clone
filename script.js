let currentSong = new Audio();
let songs;
let currFolder;

const formatSeconds = (seconds) => {
  if (isNaN(seconds) || seconds < 0) {
    return '00:00';
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${paddedMinutes}:${paddedSeconds}`;
};

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(
    `/${folder}/`
  );
  let response = await a.text();
  let div = document.createElement('div');
  div.innerHTML = response;
  let as = div.getElementsByTagName('a');
  songs = [];
  for (let i = 0; i < as.length; i++) {
    const element = as[i];
    if (element.href.endsWith('.mp3')) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  let songUL = document
    .querySelector('.songList')
    .getElementsByTagName('ul')[0];
  songUL.innerHTML = '';
  songs.forEach((song) => {
    let songName = decodeURI(song).split('_')[0].split('.')[0];
    let songArtist = decodeURI(song)
      .split('.')[0]
      .split('_')[1]
      .replaceAll('%2C', ',')
      .replaceAll('%26', '&');

    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
          <img class="invert" src="img/music.svg" alt="music" />
          <div class="info">
            <div>${songName}</div>
            <div>${songArtist}</div>
          </div>
          <div class="playNow flex justify-center align-center">
            <span>Play Now</span>
            <img class="invert" src="img/play.svg" alt="playnow" />
          </div>
      </li>`;
  });

  Array.from(
    document.querySelector('.songList').getElementsByTagName('li')
  ).forEach((element) => {
    element.addEventListener('click', () => {
      playMusic(
        `${element.querySelector('.info').firstElementChild.innerHTML}_${
          element.querySelector('.info').lastElementChild.innerHTML
        }.mp3`
      );
    });
  });

  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = 'img/pause.svg';
  }

  document.querySelector('.songInfo').innerHTML = `<span class='scroll-text'>
  
      ${decodeURI(track.split('.')[0]).split('_')[0].replaceAll('%2C', ',')}

    </span>`;

  if (
    document.querySelector('.scroll-text').scrollWidth >
    document.querySelector('.songInfo').clientWidth
  ) {
    document.querySelector('.scroll-text').classList.add('animate');
  }

  document.querySelector('.songTime').innerHTML = '00:00 / 00:00';
};

async function displayAlbums() {
  let a = await fetch(
    '/songs/'
  );
  let response = await a.text();
  let div = document.createElement('div');
  div.innerHTML = response;
  let anchors = div.getElementsByTagName('a');
  let array = Array.from(anchors);
  for (let i = 0; i < array.length; i++) {
    const e = array[i];

    if (e.href.includes('/songs/')) {
      let folder = e.href.split('/').slice(-1)[0];
      let a = await fetch(
        `/songs/${folder}/info.json`
      );
      let response = await a.json();
      let cardContainer = document.querySelector('.cardContainer');
      cardContainer.innerHTML += `
      <div class="card" data-folder="${folder}">
        <div class="play flex justify-center align-center">
          <img src="img/play_blackfill.svg" alt="play" />
        </div>
        <img src="songs/${folder}/cover.jpg" alt="">
        <h2>${response.title}</h2>
        <p>${response.description}</p>
      </div>
      `;
    }
  }
}

async function main() {
  await getSongs('/songs/Recovery');

  await displayAlbums();

  playMusic(songs[0], true);

  play.addEventListener('click', () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = 'img/pause.svg';
    } else {
      currentSong.pause();
      play.src = 'img/play.svg';
    }
  });

  previous.addEventListener('click', () => {
    let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  next.addEventListener('click', () => {
    console.log(songs);
    console.log(currentSong.src.split('/').slice(-1)[0]);
    let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  currentSong.addEventListener('timeupdate', () => {
    document.querySelector('.songTime').innerHTML = `${formatSeconds(
      currentSong.currentTime
    )} / ${formatSeconds(currentSong.duration)}`;
    document.querySelector('.circle').style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + '%';
  });

  document.querySelector('.seekbar').addEventListener('click', (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector('.circle').style.left = percent + '%';
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  document.querySelector('.hamburger').addEventListener('click', () => {
    document.querySelector('.left').style.left = '0';
  });

  document.querySelector('.close').addEventListener('click', () => {
    document.querySelector('.left').style.left = '-120%';
  });

  document
    .querySelector('.range')
    .getElementsByTagName('input')[0]
    .addEventListener('click', (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
    });

  Array.from(document.getElementsByClassName('card')).forEach((e) => {
    e.addEventListener('click', async (item) => {
      songs = await getSongs(`/songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });

  document.querySelector('.volume > img').addEventListener('click', (e) => {
    if (e.target.src.includes('volume.svg')) {
      e.target.src = e.target.src.replace('volume.svg', 'mute.svg');
      currentSong.volume = 0;
      document
        .querySelector('.range')
        .getElementsByTagName('input')[0].value = 0;
    } else {
      e.target.src = e.target.src.replace('mute.svg', 'volume.svg');
      currentSong.volume = 0.3;
      document
        .querySelector('.range')
        .getElementsByTagName('input')[0].value = 30;
    }
  });
}

main();
