const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const multer = require('multer');


var app = express();
require('./Database/DB');
const User = require('./Model/User');
const auth = require('./Middleware/auth');
const post = require('./Model/Post');
const Comment = require('./Model/Comment');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'uploads')));


//--------------------------------------------------------------------------------------------------
app.post('/Register', (req, res) => {
  console.log(req.body);
  User.findOne({ username: req.body.username }).then(function (user) {
    if (user) {
      res.json({ message: "User already exist" });
    } else {
      var users = new User(req.body);
      users.save().then(function (val) {

        res.json({ message: "Register complete" });
      });

    }
  })
});
//--------------------------------------------------------------------------------- 
app.post('/login', async function (req, res) {
  console.log(req.body)
  const Users = await User.checkCrediantialsDb(req.body.username, req.body.password);
  if (Users) {
    const token = await Users.generateAuthToken();
    res.send({
      message: "Success",
      token: token,
      userdata: Users,
      id: Users.id
    });
  } else {
    res.json({
      message: "Invalid login"
    })
  }

});
//--------------------------------------------------------------------------------------------- 
var storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    let ext = path.extname(file.originalname);
    callback(null, file.fieldname + '-' + Date.now() + ext);
  }
});

var imageFileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|PNG|gif|webp)$/)) {
    return cb(new Error('You can upload only image files!'), false);
  }
  cb(null, true);
};

var upload = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 10000000 }
});

app.post(('/uploads'), upload.single('imageFile'), (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json(req.file);
});
app.post(('/imageupload'), upload.single('imageName'), (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json(req.file.filename);
});
//---------------------------------------------------------------------------------------------------
//------------------get Token data-----------------//
app.get('/users/me', auth, function (req, res) {

  res.json(req.user)
})
//----------------------------------------------------.//
//-----------upload image-----------------------------------//
app.post('/uploadimage', auth, function (req, res) {
  var datetime = new Date();
  console.log(datetime);
  data = {
    Userid: req.user._id,
    status: req.body.status,
    destination: req.body.destination,
    postdate: datetime,
    image: req.body.image
  }
  const Post = new post(data);
  Post.save().then(function () {
    res.json({ message: "Uploded" })
  }).catch(function (e) {
    res.send(e)
  });
});
//-----------------------------------------------------------------------------------------//
//-----------get the post-------------------------------------------------------------//
app.get('/get/post', function (req, res) {
  post.find().sort({ postdate: -1 }).populate('Userid').exec().then(function (posts) {
    if (posts) {
      res.json(posts)
    }
  })

})
//-------------own post-------------------//
app.get('/get/ownpost', auth, function (req, res) {
  post.find({ Userid: req.user._id }).sort({ postdate: -1 }).populate('Userid').exec().then(function (posts) {
    if (posts) {
      res.json(posts)
    }
  })
})
//-----------------------------update post------------------------------------//
app.put('/updateprofile', auth, function (req, res) {
  User.findByIdAndUpdate(req.user._id, req.body, { new: true }, (err, user) => {
    res.json(user);
  });
})
//-----------------------single post--------------------------//
app.get('/singlepost/:id', function (req, res) {
  uid = req.params.id.toString();
  post.findOne({ _id: uid }).populate('Userid').exec().then(function (posts) {
    if (posts) {
      res.json(posts);
    }
  })
})
app.post('/search', function (req, res) {
  post.find({des:req.body.destination}).populate('Userid').exec().then(function (posts) {
    if (posts) {
      res.json(posts);
    }
  })
})
//-----------------Comment posts------------------------//
app.post('/commentdata', auth, function (req, res) {
  console.log(req.body);

  var date = new Date();
  data = {
    'postid': req.body.postid,
    'comment': req.body.comment,
    'Userid': req.user._id,
    'date': date
  }

  var commentmech = new Comment(data);
  commentmech.save().then(function () {
    res.send({ message: "Succesfull" })
  })
})

//-----------get comment according to the posts--------------------//
app.get('/getcommentdata/:id', auth, function (req, res) {
  uid = req.params.id.toString();
  console.log(uid)
  Comment.find({ postid: uid })
    .populate('Userid')
    .exec()
    .then(function (docs) {
      if (docs) {
        console.log(docs);
        res.json(
          {
            orders: docs.map(doc => {
              return {
                _id: doc._id,
                postid: doc.postid,
                comment: doc.comment,
                Userid: doc.Userid,
                date: doc.date
              };
            })
          })
      }

    })
})
app.get('/getcomment/:id',function (req, res) {
  uid = req.params.id.toString();
  console.log(uid)
  Comment.find({ postid: uid })
    .populate('Userid')
    .exec()
    .then(function (docs) {
      if (docs) {
        console.log(docs);
        res.json(
          docs.map(doc => {
              return {
                _id: doc._id,
                postid: doc.postid,
                comment: doc.comment,
                Userid: doc.Userid,
                date: doc.date
              };
            })
          )
      }

    })
})
//-------------update comments---------------------------//
app.put('/updatecommentdata', function (req, res) {
  console.log(req.body);
  Comment.findByIdAndUpdate(req.body.id, { comment: req.body.comment }, { new: true }, (err, user) => {
    res.json({ message: "succesfull" });

  })
})
//-----------------delete comments------------------------//
app.delete('/deletecommentdata/:id', function (req, res) {
  uid = req.params.id.toString();
  Comment.findByIdAndDelete(uid).then(function () {
    res.json({ message: "succesfull" })
  })

})
//------------------------edit post------------------------//
app.put("/editchange/:id", function (req, res) {
  uid = req.params.id.toString();
  console.log(uid);
  console.log(req.body);
  date = new Date();
  post.findByIdAndUpdate(uid, { $set: { status: req.body.status, destination: req.body.destination, image: req.body.image, postdate: date } }, { new: true }, (err, hires) => {
    res.json({ message: "fine" });
  });
})
//------------------delete post---------------------------------/
app.delete('/deletepost/:id', function (req, res) {
  uid = req.params.id.toString();
  post.findByIdAndDelete(uid).then(function () {
    res.json({ message: "succesfull" })
  })
})
//--------------------logout all--------------------------//
app.post('/users/logoutAll', auth, async (req, res) => {

  try {
    req.user.tokens = []
    await req.user.save();
    res.json({ message: "logout" })
  } catch (e) {
    res.status(500).send()
  }
})


// --------------likes-------------
app.post('/like/:postId/:userId/', function (req, res) {
  var postId = req.params.postId;
  var userId = req.params.userId;

  post.findOne({ _id: postId }).exec(function (err, result) {
    if (err) {
      console.log("Post like error", err);
    } else {
      if (result.likedBy.includes(userId)) {
        const index = result.likedBy.indexOf(userId);
        if (index > -1) {
          result.likedBy.splice(index, 1);
        }
        result.count--;
        result.save(function (err, postRes) {
          res.json({ post: postRes });
        });
      } else {
        result.likedBy.push(userId);
        result.count++;
        result.save(function (err, postRes) {
          res.json({ post: postRes });
        });
      }
    }
  })
})

const PORT = 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}...`));
