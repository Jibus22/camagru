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
  // choper le post avec l'id, retourner un COUNT des reactions et des comments
  // + savoir si le user a liké le post

  const result = await Post.getReactions(id);

  console.log(id);
  console.log(result);
  console.log("-----------------------------");

  return res.json(result);
};
