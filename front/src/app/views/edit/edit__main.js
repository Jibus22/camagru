import { createElement } from "../../utils";
import { data_superposable } from "../data/edit_superposable";

// Returns new dimension of userImg so it can fit in containerImg (like
// object-fit: contain would do in css), and returns the offsets to position it
const imageFit = (userImg, containerImg) => {
  let w = userImg.w;
  let h = userImg.h;
  let topOffset = 0;
  let leftOffset = 0;
  const imgRatio = w / h;
  const ctnrRatio = containerImg.w / containerImg.h;

  if (imgRatio >= ctnrRatio) {
    w = containerImg.w;
    h = (containerImg.w / userImg.w) * userImg.h;
    topOffset = (containerImg.h - h) / 2;
  } else {
    h = containerImg.h;
    w = (containerImg.h / userImg.h) * userImg.w;
    leftOffset = (containerImg.w - w) / 2;
  }

  return { w: w, h: h, lOff: leftOffset, tOff: topOffset };
};

const camera = (parent) => {
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
  const video = camera.querySelector("video");
  const uploadImg = camera.querySelector(".camera__preview__upload");
  const fileInput = camera.querySelector("input");
  const captureBtn = camera.querySelector(".camera__options__capture");
  const canvas = camera.querySelector("canvas");
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
      video.classList.add("div_hide");
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
        canvas.setAttribute("width", uploadImg.naturalWidth);
        canvas.setAttribute("height", uploadImg.naturalHeight);
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
      if (uploadImg.src !== "") {
        context.drawImage(uploadImg, 0, 0, canvas.width, canvas.height);
        data = canvas.toDataURL("image/png");
      }
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

  return camera;
};

export const edit__main = (parent) => {
  const edit__main = createElement("div", ["edit__main"]);

  edit__main.append(camera(parent));

  const superposable = createElement("div", ["superposable"]);
  edit__main.prepend(superposable);
  superposable.innerHTML = data_superposable
    .map((item) => {
      return `
        <div class="superposable__img-ctnr">
          <img src=${item.img} />
        </div>
      `;
    })
    .join("");

  const supImages = superposable.querySelectorAll(".superposable__img-ctnr");
  const captureBtn = edit__main.querySelector(".camera__options__capture");
  const cameraPreview = edit__main.querySelector(".camera__preview");
  const previewVideo = cameraPreview.querySelector("video");
  const previewUpload = cameraPreview.querySelector(".camera__preview__upload");
  const previewSup = cameraPreview.querySelector(".camera__preview__sup");

  supImages.forEach((item) => {
    item.addEventListener("click", () => {
      if (item.classList.contains("superposable-selected")) return;

      supImages.forEach((item2) => {
        if (item2.classList.contains("superposable-selected"))
          item2.classList.remove("superposable-selected");
      });
      item.classList.add("superposable-selected");

      if (captureBtn.classList.contains("div_hide"))
        captureBtn.classList.remove("div_hide");

      let imgFit;

      // Whether uploaded image or video stream is selected, get calculated
      // dimensions and offset of the current superposable image so it is
      // contained in.
      if (!previewUpload.classList.contains("div_hide")) {
        imgFit = imageFit(
          { w: previewUpload.naturalWidth, h: previewUpload.naturalHeight },
          { w: cameraPreview.clientWidth, h: cameraPreview.clientHeight }
        );
      } else if (!previewVideo.classList.contains("div_hide")) {
        imgFit = imageFit(
          { w: previewVideo.videoWidth, h: previewVideo.videoHeight },
          { w: cameraPreview.clientWidth, h: cameraPreview.clientHeight }
        );
      } else {
        return;
      }

      // fit and position the preview superposable container onto the
      // upload or video preview.
      previewSup.setAttribute(
        "style",
        `width:${imgFit.w}px;height:${imgFit.h}px;top:${imgFit.tOff}px;left:${imgFit.lOff}px;`
      );

      previewSup.classList.remove("div_hide");
      const previewSupImg = previewSup.querySelector("img");
      const supImg = item.querySelector("img");

      previewSupImg.src = supImg.src;
    });
  });

  return edit__main;
};
