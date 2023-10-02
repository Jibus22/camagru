import { createElement, imageFit } from "../../utils/utils.js";

export const superposable = (edit__main) => {
  const superposable = createElement("div", ["superposable"]);
  superposable.innerHTML = data_superposable
    .map((item) => {
      return `
        <div class="superposable__img-ctnr">
          <img src=${item.img} />
        </div>
      `;
    })
    .join("");

  const captureBtn = edit__main.querySelector(".camera__options__capture");
  const cameraPreview = edit__main.querySelector(".camera__preview");
  const supImages = superposable.querySelectorAll(".superposable__img-ctnr");
  const previewVideo = cameraPreview.querySelector("video");
  const previewUpload = cameraPreview.querySelector(".camera__preview__upload");
  const previewSup = cameraPreview.querySelector(".camera__preview__sup");

  supImages.forEach((item) => {
    item.addEventListener("click", () => {
      if (item.classList.contains("superposable-selected")) {
        item.classList.remove("superposable-selected");
        captureBtn.classList.add("div_hide");
        previewSup.classList.add("div_hide");
        return;
      }

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

  return superposable;
};

const data_superposable = [
  {
    img: "/superposable/memeno.png",
  },
  {
    img: "/superposable/memeyes.png",
  },
  {
    img: "/superposable/troll.png",
  },
  {
    img: "/superposable/troll2.png",
  },
  {
    img: "/superposable/troll3.png",
  },
  {
    img: "/superposable/smart.png",
  },
  {
    img: "/superposable/toilet.png",
  },
  {
    img: "/superposable/sadcat.png",
  },
  {
    img: "/superposable/dodge.png",
  },
  {
    img: "/superposable/dodgecred.png",
  },
  {
    img: "/superposable/urfault.png",
  },
  {
    img: "/superposable/motivated.png",
  },
  {
    img: "/superposable/oh.png",
  },
  {
    img: "/superposable/sadmj.png",
  },
  {
    img: "/superposable/burger.png",
  },
  {
    img: "/superposable/cave.png",
  },
  {
    img: "/superposable/christmas.png",
  },
  {
    img: "/superposable/heart.png",
  },
  {
    img: "/superposable/moving.png",
  },
  {
    img: "/superposable/plumber.png",
  },
  {
    img: "/superposable/redtshirt.png",
  },
  {
    img: "/superposable/treepng.png",
  },
  {
    img: "/superposable/tshirt.png",
  },
  {
    img: "/superposable/wine.png",
  },
];
