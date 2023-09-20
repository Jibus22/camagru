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
