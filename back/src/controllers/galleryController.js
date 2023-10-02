import { sendMail } from "../mail/sendMail.js";
import * as Post from "../models/postModel.js";
import * as User from "../models/userModel.js";
import mergeImages from "merge-images";
import { Canvas, Image } from "canvas";
import { removeFiles } from "../utils.js";

export const getPosts = async (req, res) => {
  const { page, limit } = req.body;

  if (!page || !limit) return res.status(400).json({ oops: "oops" });

  const posts = await Post.findSome(page - 1, limit);

  return res.json(posts);
};

export const getReactions = async (req, res) => {
  const { id } = req.body;
  let clicked;

  if (req.session) clicked = await Post.isLiked(req.session.id, id);

  const result = await Post.getReactions(id);

  result.liked = clicked?.case == true ? true : false;

  return res.json(result);
};

export const likePost = async (req, res) => {
  if (!req.session)
    return res.status(401).json({ ok: false, msg: "Not authentified" });

  const { id, isLiked } = req.body;

  try {
    if (isLiked == true) {
      await Post.dislike(req.session.id, id);
    } else if (isLiked == false) {
      await Post.like(req.session.id, id);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false });
  }

  return res.json({ ok: true });
};

export const getComments = async (req, res) => {
  const { id } = req.body;
  let comments;

  try {
    comments = await Post.getComments(id);
  } catch (err) {
    console.error(err);
    return res.status(500).json([]);
  }

  res.json(comments);
};

export const getPostsNb = async (req, res) => {
  let count;

  try {
    count = await Post.count();
  } catch (err) {
    console.error(err);
    return res.status(500).json([]);
  }

  res.json(count);
};

export const comment = async (req, res) => {
  const { comment, id } = req.body;

  if (!comment.length) return res.json({ sent: false });

  try {
    await Post.comment(req.session.id, id, comment);
    const postAuthor = await User.findByPost(id);
    if (postAuthor.post_notif) {
      try {
        await sendMail({
          to: postAuthor.email,
          subject: "Your post had been commented",
          html: `<h2>Hi ${postAuthor.username}</h2>
        <p>${req.session.username} commented one of your post:</p>
        <p>${comment}</p>
        `,
        });
      } catch (err) {
        console.error("INVALID USER MAIL. " + err);
      }
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ sent: false });
  }

  res.json({ sent: true });
};

export const newPost = async (req, res) => {
  const baseImg = req.files.baseImg[0].filepath;
  const supImg = req.files.supImg[0].filepath;

  mergeImages([baseImg, supImg], {
    Canvas: Canvas,
    Image: Image,
  }).then((b64) => {
    const buffer = Buffer.from(b64.replace(/^[\w\d/;:]+,/, ""), "base64");
    res.json({ image: buffer });
    removeFiles([baseImg, supImg]);
  });
};

export const postPublish = async (req, res) => {
  const photo = new Uint8Array(req.body);

  try {
    await Post.create(req.session.id, photo);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, msg: "internal error." });
  }

  res.json({ ok: true, msg: "published" });
};

export const getCreations = async (req, res) => {
  let creations;
  try {
    creations = await Post.getCreations(req.session.id);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, msg: "internal error." });
  }

  res.json({ ok: true, creations });
};

export const getPhotoCreation = async (req, res) => {
  try {
    const { photo } = await Post.getPhotoCreation(req.body.id);

    res.setHeader("Content-Type", "application/octet-stream");
    res.end(photo);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, msg: "internal error." });
  }
};

export const deletePost = async (req, res) => {
  try {
    await Post.deleteOne(req.body.id, req.session.id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, msg: "internal error." });
  }
};
