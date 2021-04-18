import React,{useState,useEffect} from "react";
import { auth, storage, db } from "./firebase";
import "./App.css";
import {
  Button,
  Typography,
  CardContent,
  
} from "@material-ui/core";


const ShowComment = ({pid}) => {

  const postsPerPage = 3;
  let show = [];


  const [comments, setComments] = useState([]);
  const [commentstoshow, setCommenttoshow] = useState([]);
  const [next, setNext] = useState(3);
  const [arrayForHoldingPosts, setarrayForHoldingPosts] = useState([]);

  
  
  useEffect(() => {

    let unsubscribe;
    if (pid) {
      unsubscribe = db
        .collection("igdata")
        .doc(pid)
        .collection("comments")
        .orderBy("timestamp", "desc")
        .onSnapshot((snapshot) => {
          setComments(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              comment: doc.data(),
            }))
          );
        });

        
      }

    return () => {
      unsubscribe();
    };
  },[pid]);
  

  



  useEffect(() => {
  

    loopWithSlice(0, postsPerPage);



  }, [comments]);

  
  const loopWithSlice = (start,end) => {
  const mincomment=comments.slice(start,end);
    setCommenttoshow(mincomment);

  }

  const handleShowMorePosts = () => {
    loopWithSlice(0, next + postsPerPage);
    setNext(next + postsPerPage);
  }

  return (
    <>
    <div  className="card">
     
    <CardContent>
          
        
        <div id="commentlable">Comments:-</div>
        {commentstoshow.map(({ id, comment }) => (
          <Typography  vcomponent="p" key={id} className="comment">
           <strong>{comment.username}</strong> {comment.text}
          </Typography>
        ))}
   
  
      { 
        commentstoshow.length<comments.length
    ?  <Button style={{ width:"100%", margin: "auto",textTransform: "capitalize"}} color="primary" size="small"  onClick={handleShowMorePosts}>More...</Button>
      :<div></div>
          
          
        }
        </CardContent>
        
      </div>
    </>
  );
};

export default ShowComment;
