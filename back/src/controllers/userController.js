import * as User from "../models/userModel.js";
import * as MailUpdate from "../models/mailUpdateModel.js";

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

export const editProfile = async (req, res) => {
  const { email, username, password, enable, disable } = req.body;
  let info = "";

  try {
    if (username) {
      await User.updateById(req.session.id, { username });
      info = info + ` Username updated to ${username}.`;
    }

    if (email) {
      const newMail = await MailUpdate.create(req.session.id, email);

      const link = "http://localhost:4000/mailupdate/" + newMail.id;

      try {
        await sendMail({
          to: email,
          subject: "mail update confirmation",
          html: `<h2>Hi ${
            username ? username : req.session.username
          }</h2><p>Please confirm your mail update by clicking on this link: <a href=${link} target='blank'>link</a></p>`,
        });
      } catch (err) {
        console.error(err);
        await MailUpdate.deleteById(newMail.id);
      }

      info = info + ` Check your mail to confirm your change to ${email}.`;
    }

    if (password) {
      const hash = await bcrypt.hash(password, saltRounds);
      await User.updateById(req.session.id, { password: hash });
      info = info + " Password updated.";
    }

    if (enable) {
      await User.updateById(req.session.id, { post_notif: true });
      info = info + " Email notification enabled.";
    } else if (disable) {
      await User.updateById(req.session.id, { post_notif: false });
      info = info + " Email notification disabled.";
    }

    return res.json({ auth: true, msg: info });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      auth: info.length > 0 ? true : false,
      msg: "internal error." + info,
    });
  }
};

export const updateAvatar = async (req, res) => {
  const photo = new Uint8Array(req.body);

  try {
    await User.updateById(req.session.id, { photo });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, msg: "internal error." });
  }

  res.json({ ok: true, msg: "updated" });
};
