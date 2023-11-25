var express = require("express");
var router = express.Router();
const userModel = require("./users");
const postModel = require("./posts");
const passport = require("passport");
const upload = require("./multer")

const localStratergy = require('passport-local');
passport.use(new localStratergy(userModel.authenticate()));




router.get("/create",async function(req,res,next){
  let createduser = await userModel.create({
    username: "ayush",
    password: "ayush",
    posts: [],
    email: "ayush0315@gmail.com",
    fullName: "Ayush R Patil",
  });
  res.send(createduser);
});
router.get("/",function(req,res){
  res.render('index',{title: 'Express'});
});

router.get("/login",function(req,res){
  res.render('login',{error: req.flash('error')});
});

router.get("/feed",function(req,res){
  res.render('feed');
});

router.post("/upload",isLoggedIn, upload.single("file"), async function(req, res, next) {
  if(!req.file){
    return res.status(404).send("no files were given");
  }
  const user = await userModel.findOne({username: req.session.passport.user});
  const post = await postModel.create({
    image: req.file.filename,
    imageText: req.body.filecaption,
    user: user._id
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

router.get("/profile",isLoggedIn, async function(req, res, next){
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  .populate("posts");
  console.log(user);
  res.render("profile",{user});
});

router.post("/register", function(req, res){
  const { username, email, fullname } = req.body;
  const userData = new userModel({ username, email, fullname });

  userModel.register(userData, req.body.password)
    .then(function () {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/profile");
      })
    })

  })

router.post("/login",passport.authenticate("local",{
  successRedirect: "/profile",
  failureRedirect: "/login",
  failureFlash: true
}), function(req,res){
});

router.get("/logout",function(req, res){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()) return next();
  res.redirect("/login");
}






module.exports = router;
