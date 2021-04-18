import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import ShowComment from "./ShowComment";
import FavoriteIcon from "@material-ui/icons/Favorite";

import {
  Button,
  Typography,
  CardHeader,
  CardContent,
  TextField,
  CardActions,
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
} from "@material-ui/core";

const Post = ({
  user,
  postUser,
  id,
  email,
  imgURL,
  captionVal,
  timeStamp,
}) => {
  const [value, setValue] = useState(1);
  const [comment, setComment] = useState("");
  const [color, setColor] = useState("gray");
  const [background, setBackground] = useState("gray");
  const [likes, setLikes] = useState(0);
  const [allID, setAllID] = useState([]);
  const [btnDisabled, setBtnDisabled] = useState(true);

  // for random background color
  function randomColor() {
    let hex = Math.floor(Math.random() * 0xffffff);
    let color = "#" + hex.toString(16);

    return color;
  }

  useEffect(() => {
    setBackground(randomColor());
  }, []);
  // ------------------------------------

  useEffect(() => {
    setColor("gray");
    let unsubscribe;
    if (id) {
      unsubscribe = db
        .collection("igdata")
        .doc(id)
        .collection("likes")
        .onSnapshot((snapshot) => {
          setLikes(snapshot.size);
          setAllID(
            snapshot.docs.map((doc) => ({
              lid: doc.id,
              likes: doc.data(),
            }))
          );

          snapshot.docs.map((doc) => {
            let postemail = doc.data().email;
            if (postemail == email) {
              setColor("red");
            }
          });
        });
    }

    return () => {
      unsubscribe();
    };
  }, [email]);

  // Getlikes ❤️

  const getLikes = () => {
    db.collection("igdata")
      .doc(id)
      .collection("likes")
      .onSnapshot((snapshot) => {
        setLikes(snapshot.size);
        setAllID(
          snapshot.docs.map((doc) => ({
            lid: doc.id,
            likes: doc.data(),
          }))
        );
      });
  };

  //  Updatelikes

  const updateLike = () => {
    let likeornot = 0;
    const islike = () => {
      allID.map(({ lid, likes }) => {
        let lemail = likes.email;
        if (lemail == email) {
          db.collection("igdata").doc(id).collection("likes").doc(lid).delete();

          likeornot = 1;
          return;
        }
      });
    };

    //  check the user like or not

    islike();

    if (likeornot) {
      setColor("gray");
      console.log("grayu");
      getLikes();
    } else {
      db.collection("igdata").doc(id).collection("likes").add({
        email: email,
      });
      setColor("red");

      getLikes();
    }
  };
  // ---------------------------
  return (
    <>
      {/* main post */}

      <div className="card" key={id}>
        <CardHeader
          avatar={
            <Avatar
              className="post__avatar"
              alt={postUser}
              src={postUser}
              style={{
                backgroundColor: background,
              }}
            />
          }
          title={postUser}
          id="avatarText"
          subheader={timeStamp}
        />
        <img id="postimg" src={imgURL} alt="postimage" />
        <CardContent>
          <Typography className="caption" vcomponent="caption">
            <span>
              <strong>{`@${postUser}`}</strong>
            </span>
            {captionVal}
          </Typography>
        </CardContent>

        {/* ------------------------------------------ */}

        {/* new component */}
        <ShowComment pid={id} />


     {/* Comment and like card if user exist */}
  {   (user)?
            (
        <CardActions>
          <BottomNavigation
            value={value}
            onClick={(event, newValue) => {
              setValue(newValue);
            }}
            showLabels
          >
            <BottomNavigationAction
              onClick={updateLike}
              style={{ color }}
              label={likes}
              icon={<FavoriteIcon />}
            />

            <form className="commentSection">
              <TextField
                style={{ margin: 8 }}
                placeholder="Add Comment"
                type="text"
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  setBtnDisabled(!e.target.value);
                }}
              />

              <Button
                className="commentBtn"
                className="post_button"
                color="primary"
                disabled={btnDisabled}
                onClick={() => {
                  db.collection("igdata").doc(id).collection("comments").add({
                    timestamp: new Date(),
                    text: comment,
                    username: user,
                  });

                  setComment("");
                  setBtnDisabled(true);
                }}
                size="small"
              >
                post
              </Button>
            </form>
          </BottomNavigation>
        </CardActions>

  ): null}
      </div>

    </>

  );
};

export default Post;
