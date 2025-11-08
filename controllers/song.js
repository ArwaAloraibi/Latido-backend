const express = require("express");
const router = express.Router();

const song = require("../models/song");

router.get("/", async (req, res) => {
  try {
    const songs = await song.find({}).populate("user");
    res.render("songs/index.ejs", { songs });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});



router.get("/new", (req, res) => {
  res.render("songs/new.ejs");
});

router.post("/", async (req, res) => {
  try {
    req.body.owner = req.session.user._id; 
    await song.create(req.body);
    res.redirect("/songs");
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const song = await song.findById(req.params.id)
      .populate("user")

    res.render("songs/show.ejs", { song });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

router.get("/:id/edit", async (req, res) => {
  try {
    const song = await song.findById(req.params.id);
    res.render("songs/edit.ejs", { songs });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

router.put("/:id", async (req, res) => {
  try {
    const song = await song.findById(req.params.id);
    if (song.owner.equals(req.session.user._id)) {
      await song.updateOne(req.body);
      res.redirect(`/songs/${req.params.id}`);
    } else {
      console.log("Permission denied");
      res.redirect("/songs");
    }
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const song = await song.findById(req.params.id);
    if (song.owner.equals(req.session.user._id)) {
      await song.deleteOne();
      res.redirect("/songs");
    } else {
      console.log("Permission denied");
      res.redirect("/songs");
    }
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});


module.exports = router;
