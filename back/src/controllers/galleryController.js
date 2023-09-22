import { sendMail } from "../mail/sendMail.js";
import * as Post from "../models/postModel.js";
import * as User from "../models/userModel.js";

export const getPosts = async (req, res) => {
  const { page, limit } = req.body;

  if (!page || !limit) return res.status(400).json({ oops: "oops" });

  const posts = await Post.findSome(page - 1, limit);

  console.log(posts);

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
    console.log(err);
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
    console.log(err);
    return res.status(500).json([]);
  }

  res.json(comments);
};

export const getPostsNb = async (req, res) => {
  let count;

  try {
    count = await Post.count();
  } catch (err) {
    console.log(err);
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
      await sendMail({
        to: postAuthor.email,
        subject: "Your post had been commented",
        html: `<h2>Hi ${postAuthor.username}</h2>
        <p>${req.session.username} commented one of your post:</p>
        <p>${comment}</p>
        `,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ sent: false });
  }

  res.json({ sent: true });
};