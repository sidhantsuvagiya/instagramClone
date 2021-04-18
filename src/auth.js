import React, { useEffect, useState } from "react";
import { auth, storage, db } from "./firebase";
import Post from "./Post";

import {
  makeStyles,
  Button,
  Dialog,
  DialogContent,
  TextField,
  LinearProgress,
  DialogActions,
  DialogTitle,
  capitalize,
} from "@material-ui/core";

import Instalogo from "./img/Instagram-Logo.png";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import "./App.css";

const Auth = () => {
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClickOpen2 = () => {
    setOpen2(true);
  };
  const handleClickOpen3 = () => {
    setOpen3(true);
  };

  const handleClose = () => {
    setOpen(false);
    setOpen2(false);
    setOpen3(false);
  };

  const [userLogin, setuserLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState("");
  const [posts, setPosts] = useState([]);
  const [postToShow, setPostToShow] = useState(3);
  const [caption, setCaption] = useState();
  const [image, setImage] = useState(null);
  const [progress, setProgress] = useState(0);

  //  matireal ui style
  const useStyles = makeStyles({
    root: {
      height: 0,
      textAlign: "center",
      fontSize: "90",
    },
    progress: {
      width: "100%",
    },
  });

  const classes = useStyles();
  // ------------------------

  //  getPost

  useEffect(() => {
    db.collection("igdata")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        setPosts(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            post: doc.data(),
          }))
        );
      });
  }, []);

  const login = () => {
    auth
      .signInWithEmailAndPassword(email, password)
      .then((e) => {
        auth.onAuthStateChanged((authUser) => {
          if (authUser !== null) {
            // user has logged in...
            setUser(authUser.displayName);
          }
        });

        setuserLogin(true);
        handleClose();
      })
      .catch((e) => {
        alert(e.message);
        handleClose();
      });
  };

  // signUP
  const signup = () => {
    auth
      .createUserWithEmailAndPassword(email, password)
      .then((authUser) => {
        authUser.user.updateProfile({
          displayName: user,
        });

        setuserLogin(true);
        handleClose();
      })
      .catch((e) => {
        alert(e.message);
        handleClose();
      });
  };

  const logOut = (e) => {
    auth.signOut();
    setUser(null);
    setEmail("");
    setPassword("");
    setuserLogin(false);
  };

  const handleFile = (e) => {
    setImage(e.target.files[0]);
  };

  const sendPost = () => {
    if (image && image.size <= 3000000) {
      const uploadIMG = storage.ref(`images/${image.name}`).put(image);
      uploadIMG.on(
        "state_changed",
        (snapshot) => {
          setProgress(
            Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          );
        },
        (err) => {
          console.log(err);
          alert(err.message);
        },
        () => {
          storage
            .ref(`images`)
            .child(image.name)
            .getDownloadURL()
            .then((url) => {
              db.collection("igdata").add({
                timestamp: new Date(),
                userName: user,
                caption: caption,
                imgURL: url,
                likes: 0,
              });
            });
          setImage(null);
          setCaption("");
          setProgress(0);
          handleClose();
        }
      );
    } else {
      alert("Error Please Choose An Image OR Less Than 3MB ");
    }
  };

  // return statement

  return (
    <>

      <header>
        <img className="instalogo" src={Instalogo} alt="" srcset="" />

        {!userLogin ? (
          <>
            <div className="signupLogin">
              <Button
                variant="outlined"
                color="primary"
                onClick={handleClickOpen}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleClickOpen2}
              >
                Sign Up
              </Button>
            </div>

            {/* pop up coding  1st login */}

            <Dialog
              open={open}
              onClose={handleClose}
              aria-labelledby="form-dialog-title"
            >
              <DialogTitle className={classes.root} id="form-dialog-title">
                Sign In
              </DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Enter Email"
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                />
                <TextField
                  margin="dense"
                  label="Enter Password"
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  fullWidth
                />
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  variant="outlined"
                  color="secondary"
                >
                  Cancel
                </Button>
                <Button onClick={login} variant="outlined" color="primary">
                  Sign In
                </Button>
              </DialogActions>
            </Dialog>

            {/* dialog 2  sign up */}
            <Dialog
              style={{ maxWidth: 350, margin: "auto" }}
              open={open2}
              onClose={handleClose}
              aria-labelledby="form-dialog-title"
            >
              <DialogTitle className={classes.root} id="form-dialog-title">
                Sign Up
              </DialogTitle>
              <DialogContent>
                <TextField
                  style={{ textTransform: capitalize }}
                  autoFocus
                  margin="dense"
                  label="Your Name"
                  type="text"
                  onChange={(e) => {
                    if (e.target.value) {
                      setUser(e.target.value);
                    }
                  }}
                  fullWidth
                />
                <TextField
                  margin="dense"
                  label="Enter Email "
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                />
                <TextField
                  margin="dense"
                  label="Enter Password"
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                />
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  variant="outlined"
                  color="secondary"
                >
                  Cancel
                </Button>
                <Button onClick={signup} variant="outlined" color="primary">
                  Sign Up
                </Button>
              </DialogActions>
            </Dialog>
          </>
        ) : (
          <>
            {/* Log Out */}
            <div className="signupLogin">
              <Button
                ml={5}
                className="logout"
                variant="contained"
                color="secondary"
                onClick={logOut}
              >
                Log out
              </Button>

              <Button
                variant="contained"
                color="primary"
                onClick={handleClickOpen3}
              >
                Add Post
              </Button>
            </div>

            {/* pop up coding for Upload */}
            <Dialog
              style={{ maxWidth: 350, margin: "auto" }}
              open={open3}
              onClose={handleClose}
              aria-labelledby="form-dialog-title"
            >
              <DialogTitle className={classes.root} id="form-dialog-title">
                Upload Post
              </DialogTitle>
              <DialogContent>
                <div>
                  <TextField
                    autoFocus
                    margin="dense"
                    label="Caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    type="text"
                    fullWidth
                  />
                  <TextField
                    color="primary"
                    margin="dense"
                    style={{ margin: "8px 0 14px 0" }}
                    onChange={handleFile}
                    type="file"
                    fullWidth
                  />

                  <LinearProgress variant="determinate" value={progress} />
                </div>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  variant="outlined"
                  color="secondary"
                  size="large"
                >
                  Cancle
                </Button>

                <Button
                  color="primary"
                  onClick={sendPost}
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                >
                  Upload
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </header>

      {/* show all post  */}

      <div className="postContainer">
        {posts.map(({ id, post }, index, arr) =>
          index < postToShow ? (
            <Post
              key={id}
              user={user}
              postUser={post.userName}
              id={id}
              email={email}
              imgURL={post.imgURL}
              captionVal={post.caption}
              timeStamp={String(post.timestamp.toDate().toLocaleString())}
            />
          ) : null
        )}
      </div>
      {/* limit post only 3 */}
      {postToShow < posts.length ? (
        <Button
          color="primary"
          style={{ width: "100%", margin: "auto", textTransform: "capitalize" }}
          onClick={() => setPostToShow(postToShow + 3)}
        >
          Show More Post...
        </Button>
      ) : null}

    
    
    </>
  );
};

export default Auth;
