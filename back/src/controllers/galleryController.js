import * as Post from "../models/postModel.js";

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
