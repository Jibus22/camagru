import { createElement, imageFit } from "../../utils";

export const camera = (parent) => {
  const camera = createElement("div", ["camera"]);

  camera.innerHTML = `
    <div class="camera__preview">
      <video autoplay>Video stream is unavailable.</video>
      <img class="camera__preview__upload div_hide"/>
      <div class="camera__preview__sup div_hide"><img/></div>
    </div>
    <canvas></canvas>
    <div class="camera__options">
      <button class="camera__options__capture div_hide"><span class="icon-circle-o"></span></button>
      <label for="file-upload" class="camera__options__upload">
        <span class="icon-file_upload"></span>
      </label>
      <input id="file-upload" type="file" accept="image/*"/>
    </div>
  `;

  const edit__side = parent.querySelector(".edit__side");
  const previewVideo = camera.querySelector("video");
  const previewUpload = camera.querySelector(".camera__preview__upload");
  const fileInput = camera.querySelector("input");
  const captureBtn = camera.querySelector(".camera__options__capture");
  const canvas = camera.querySelector("canvas");
  const context = canvas.getContext("2d");

  // Require the user's webcam video stream, then append it to the video element
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      previewVideo.srcObject = stream;
      window.localStream = stream;
    })
    .catch((err) => {
      console.error(`Une erreur est survenue : ${err}`);
      previewVideo.classList.add("div_hide");
    });

  let streaming = false;

  // If canplay event is triggered then the video stream is effectively
  // beginning so that the video object is configured from the video stream.
  previewVideo.addEventListener(
    "canplay",
    () => {
      if (!streaming) {
        // Set canvas ratio the same as the user's webcam video stream.
        canvas.setAttribute("width", previewVideo.videoWidth);
        canvas.setAttribute("height", previewVideo.videoHeight);
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
      if (!previewVideo.classList.contains("div_hide"))
        previewVideo.classList.add("div_hide");
      if (previewVideo.classList.contains("div_hide"))
        previewUpload.classList.remove("div_hide");

      previewUpload.addEventListener("load", () => {
        URL.revokeObjectURL(previewUpload.src); // no longer needed, free memory
        canvas.setAttribute("width", previewUpload.naturalWidth);
        canvas.setAttribute("height", previewUpload.naturalHeight);
      });
      previewUpload.src = URL.createObjectURL(file);
    }
  });

  captureBtn.addEventListener("click", (e) => {
    let data = null;
    let mainImg = null;

    if (streaming) {
      // Draw the video frame to the canvas.
      mainImg = { w: previewVideo.videoWidth, h: previewVideo.videoHeight };
      context.drawImage(previewVideo, 0, 0, canvas.width, canvas.height);
    } else if (previewUpload.src !== "") {
      mainImg = {
        w: previewUpload.naturalWidth,
        h: previewUpload.naturalHeight,
      };
      context.drawImage(previewUpload, 0, 0, canvas.width, canvas.height);
    } else {
      return;
    }

    const supImg = camera
      .querySelector(".camera__preview__sup")
      .querySelector("img");

    const imgFit = imageFit(
      { w: supImg.naturalWidth, h: supImg.naturalHeight },
      mainImg
    );
    const myImage = new Image(imgFit.w, imgFit.h);
    myImage.src = supImg.src;
    context.drawImage(myImage, imgFit.lOff, imgFit.tOff, imgFit.w, imgFit.h);

    data = canvas.toDataURL("image/png");
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

  return camera;
};
