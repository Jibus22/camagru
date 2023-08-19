import { createElement } from "../../utils";

export const edit__main = (parent) => {
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
      </div>
      <canvas></canvas>
      <div class="camera__options">
        <button class="camera__options__capture"><span class="icon-circle-o"></span></button>
        <button class="camera__options__upload"><span class="icon-file_upload"></span></button>
      </div>
    </div>
  `;

  const edit__side = parent.querySelector(".edit__side");
  const video = edit__main.querySelector("video");
  const captureBtn = edit__main.querySelector(".camera__options__capture");
  const canvas = edit__main.querySelector("canvas");
  const context = canvas.getContext("2d");

  // Require the user's webcam video stream, then append it to the video element
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
    const removeBtn = thumbnail.querySelector(".remove-btn");

    img.setAttribute("src", data);
    removeBtn.addEventListener("click", () => thumbnail.remove());

    edit__side.prepend(thumbnail);
    e.preventDefault();
  });

  return edit__main;
};
