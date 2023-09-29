import { createElement, imageFit, postHttpRequest } from "../../utils/utils.js";

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
      if (import.meta.env.DEV)
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

  captureBtn.addEventListener("click", async (e) => {
    let mainImg = null;

    e.preventDefault();

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

    const superposableImage = camera
      .querySelector(".camera__preview__sup")
      .querySelector("img");

    // imgFit contains the new dimensions and offsets to draw correctly the
    // superposable png image onto the base image.
    const imgFit = imageFit(
      { w: superposableImage.naturalWidth, h: superposableImage.naturalHeight },
      mainImg
    );

    // We take advantage of frontend to fit the superposable into new dimensions
    const myImage = new Image(imgFit.w, imgFit.h);
    myImage.src = superposableImage.src;

    // We create a canvas with the same dimensions of the base image canvas to
    // draw our superposable image alone inside it then convert it to blob and
    // be able to send it to backend through multipart form data.
    // All this sh*t is just to fit with the school subject contraints.
    // This is a project made for php backend which have a builtin function to
    // correctly merge 2 pictures.
    // As I'm doing it with nodejs and don't have this, I employ this strategy
    // to avoid spending too much time to solve this useless constraint.
    // Otherwise I would have left my first implementation with merge logic
    // in frontend.
    const canvasSup = createElement("canvas");
    const contextSup = canvasSup.getContext("2d");
    canvasSup.setAttribute("width", canvas.width);
    canvasSup.setAttribute("height", canvas.height);
    contextSup.drawImage(myImage, imgFit.lOff, imgFit.tOff, imgFit.w, imgFit.h);

    // Convert canvas data to blob data
    let superposableImageBlob = await new Promise((resolve) =>
      canvasSup.toBlob(resolve, "image/png")
    );
    let baseImageBlob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg")
    );

    // Set FormData with blobs
    const formData = new FormData();
    formData.append("baseImg", baseImageBlob);
    formData.append("supImg", superposableImageBlob);

    let response;

    // Send blobs to backend in multipart form data content-type.
    try {
      response = await fetch("http://localhost:4000/newpost", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
    } catch (err) {
      if (import.meta.env.DEV) console.error(`Error at post newpost: ${err}`);
      return;
    }

    // The backend sends back a binary image into a json
    response = await response.json();

    const editedImg = new Uint8Array(response.image.data);
    const editedImgBlob = new Blob([editedImg], { type: "image/png" });
    const editedImgUrl = URL.createObjectURL(editedImgBlob);

    // Create the thumbnail html element to add it in the side container
    const thumbnail = createElement("div", ["thumbnail-ctnr"]);
    thumbnail.innerHTML = `
      <div class="thumbnail-ctnr__underlayer">
        <button class="remove-btn"><span class="icon-remove"></span></button>
        <button class="share-btn"><span class="icon-share"></span></button>
        <img/>
      </div>
    `;

    const img = thumbnail.querySelector("img");
    // Give to img the image url from the binary we received from the backend
    img.src = editedImgUrl;

    const removeBtn = thumbnail.querySelector(".remove-btn");
    removeBtn.addEventListener("click", () => thumbnail.remove());

    const shareBtn = thumbnail.querySelector(".share-btn");
    shareBtn.addEventListener("click", () => {
      const thumbnailUnderlayer = thumbnail.querySelector(
        ".thumbnail-ctnr__underlayer"
      );
      const confirmation = createElement("div", [
        "thumbnail-ctnr__underlayer__confirmation",
      ]);
      confirmation.innerHTML = `
        <button class="green_msg" >confirm </button>
        <button class="red_msg" >cancel </button>
      `;

      const cancelBtn = confirmation.querySelector(".red_msg");
      cancelBtn.addEventListener("click", () => {
        confirmation.remove();
      });

      const confirmBtn = confirmation.querySelector(".green_msg");
      confirmBtn.addEventListener("click", async () => {
        let newResponse;
        try {
          newResponse = await postHttpRequest(
            "http://localhost:4000/post/new",
            { "Content-Type": "application/json" },
            response.image.data
          );
        } catch (err) {
          thumbnail.style = "border: 1px solid red";
          return;
        }

        if (newResponse.ok) {
          thumbnail.style = "border: 1px solid green";
          shareBtn.innerHTML = "";
          shareBtn.style = "cursor:auto;";
          shareBtn.disable = true;
          confirmation.remove();
        } else {
          thumbnail.style = "border: 1px solid red";
        }
      });

      thumbnailUnderlayer.append(confirmation);
    });

    edit__side.prepend(thumbnail);
  });

  return camera;
};
