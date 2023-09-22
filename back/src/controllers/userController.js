import * as User from "../models/userModel.js";

export const me = async (req, res) => {
  if (req.session) {
    const { id, username, email, registered, post_notif } = req.session;

    if (!registered) {
      return res.status(401).json({
        auth: false,
        msg: "You are not registered",
        username: "",
        avatar: "",
      });
    }

    let avatar = await User.getPhotoById(id);

    if (avatar) {
      ({ avatar } = avatar);
    } else {
      avatar = ""; //TODO maybe mettre l'url d'une image statique.
    }

    return res.json({
      auth: true,
      msg: "You are authenticated",
      username,
      email,
      avatar,
      registered,
      post_notif,
    });
  } else {
    return res.status(401).json({
      auth: false,
      msg: "You are not authenticated",
      username: "",
      avatar: "",
    });
  }
};
