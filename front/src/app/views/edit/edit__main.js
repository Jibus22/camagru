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
        <img class="camera__preview__upload div_hide"/>
      </div>
      <canvas></canvas>
      <div class="camera__options">
        <button class="camera__options__capture"><span class="icon-circle-o"></span></button>
        <label for="file-upload" class="camera__options__upload">
          <span class="icon-file_upload"></span>
        </label>
        <input id="file-upload" type="file" accept="image/*"/>
      </div>
    </div>
  `;

  //<button class="camera__options__upload"><span class="icon-file_upload"></span></button>
  const edit__side = parent.querySelector(".edit__side");
  const video = edit__main.querySelector("video");
  const uploadImg = edit__main.querySelector(".camera__preview__upload");
  const fileInput = edit__main.querySelector("input");
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
  video.addEventListener(
    "canplay",
    () => {
      if (!streaming) {
        // Set canvas ratio the same as the user's webcam video stream.
        canvas.setAttribute("width", video.videoWidth);
        canvas.setAttribute("height", video.videoHeight);
        streaming = true;
      }
    },
    false
  );

  fileInput.addEventListener("change", () => {
    const fileList = fileInput.files;
    let file = null;

    for (let i = 0; i < fileList.length; i++) {
      if (fileList[i].type.match(/^image\//)) {
        file = fileList[i];
        break;
      }
    }

    if (file) {
      // delete video stream
      if (window.localStream) {
        window.localStream.getVideoTracks().forEach((track) => track.stop());
        delete window.localStream;
        streaming = false;
      }

      // Hide video and show image
      if (!video.classList.contains("div_hide"))
        video.classList.add("div_hide");
      if (video.classList.contains("div_hide"))
        uploadImg.classList.remove("div_hide");

      uploadImg.addEventListener("load", () => {
        URL.revokeObjectURL(uploadImg.src); // no longer needed, free memory
      });
      uploadImg.src = URL.createObjectURL(file);
    }
  });

  captureBtn.addEventListener("click", (e) => {
    let data = null;

    if (streaming) {
      // Draw the video frame to the canvas.
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      data = canvas.toDataURL("image/png");
    } else {
      data = uploadImg.src;
    }

    if (data) {
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
    }
    e.preventDefault();
  });

  return edit__main;
};
