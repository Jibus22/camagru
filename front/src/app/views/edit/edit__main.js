import { createElement } from "../../utils";

export const edit__main = () => {
  const edit__main = createElement("div", ["edit__main"]);

  edit__main.innerHTML = `
    <div class="superposable">
      <!-- This part must be automatically generated -->

      <div class="superposable__img-ctnr">
        <img src="/images/img2.jpg" />
      </div>

      <div class="superposable__img-ctnr">
        <img src="/images/img10.jpg" />
      </div>

      <div class="superposable__img-ctnr">
        <img src="/images/img7.jpg" />
      </div>

    </div>
    <div class="camera">
      <div class="camera__preview">
        <video autoplay>Video stream is unavailable.</video>
        <!-- We should have some html which permits to preview the webcam here -->
      </div>
      <canvas></canvas>
      <div class="camera__options">
        <!-- button to capture image -->
        <button class="camera__options__capture"><span class="icon-circle-o"></span></button>
        <!-- button to upload an image in case webcam is not used -->
        <button class="camera__options__upload"><span class="icon-file_upload"></span></button>
      </div>
    </div>
  `;

  const edit__side = document.querySelector(".edit__side");
  const video = edit__main.querySelector("video");
  const captureBtn = edit__main.querySelector(".camera__options__capture");
  const canvas = edit__main.querySelector("canvas");
  const context = canvas.getContext("2d");

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;
      window.localStream = stream;
    })
    .catch((err) => {
      console.error(`Une erreur est survenue : ${err}`);
    });

  let streaming = false;

  // If canplay event is triggered then the video stream is effectively
  // beginning so that the video object is configured from the video stream.
  // Set canvas ratio the same as the user's webcam video stream.
  video.addEventListener(
    "canplay",
    () => {
      if (!streaming) {
        canvas.setAttribute("width", video.videoWidth);
        canvas.setAttribute("height", video.videoHeight);
        streaming = true;
      }
    },
    false
  );

  captureBtn.addEventListener("click", (e) => {
    // Draw the video frame to the canvas.
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL("image/png");

    const thumbnail = createElement("div", ["thumbnail-ctnr"]);
    thumbnail.innerHTML = `
      <div class="thumbnail-ctnr__underlayer">
        <button class="remove-btn"><span class="icon-remove"></span></button>
        <button class="share-btn"><span class="icon-share"></span></button>
        <img/>
      </div>
    `;

    const img = thumbnail.querySelector("img");
    img.setAttribute("src", data);

    edit__side.prepend(thumbnail);

    e.preventDefault();
  });

  return edit__main;
};
