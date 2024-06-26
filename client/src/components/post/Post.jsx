import "./post.scss";
import {
   Popover,
   List,
   ListItemButton,
   ListItemText,
   ListItemIcon,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PopupWindow from "../PopupComponent/PopupWindow";
import {
   faTrashCan,
   faPen,
   faLock,
   faEarthAmericas,
   faUserGroup,
   faUserNinja,
} from "@fortawesome/free-solid-svg-icons";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ReportOutlinedIcon from "@mui/icons-material/ReportOutlined";
import "moment/locale/ja"; // Import locale for Japanese
import "moment/locale/vi"; // Import locale for Vietnamese
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Radio from "@mui/material/Radio";

import Comments from "../comments/Comments";
import moment from "moment";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest, URL_OF_BACK_END } from "../../axios";
import { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../../context/authContext";
import Description from "./desc";
import Private from "./Private";
import { Link } from "react-router-dom";
import ReactPlayer from "react-player/lazy";
import { useLanguage } from "../../context/languageContext";
import PostEdit from "../postPopup/editComponent/PostEdit";
import PostReporter from "../postPopup/reportComponent/postReporter/PostReporter";
import PostShare from "../postPopup/shareComponent/PostShare";

const Post = ({ post, hidden }) => {
   const { trl, language } = useLanguage();
   useEffect(() => {
      if (language === "jp") {
         moment.locale("ja");
      } else if (language === "vn") {
         moment.locale("vi");
      } else {
         moment.locale("en");
      }
   }, [language]);
   const [commentOpen, setCommentOpen] = useState(false);
   const [menuAnchor, setMenuAnchor] = useState(null);

   const [showEditPopup, setShowEditPopup] = useState(false);
   const [showSharePopup, setShowSharePopup] = useState(false);
   const [showReportPopup, setShowReportPopup] = useState(false);
   const [openSeeEdit, setOpenSeeEdit] = useState(false);
   const [selectedValue, setSelectedValue] = useState(0);
   const privateRef = useRef(null);

   const isVideoContent = post.img
      ? post.img.endsWith(".mp4") ||
      post.img.endsWith(".avi") ||
      post.img.endsWith(".mov")
      : false;

   const handleShare = () => {
      setShowSharePopup(!showSharePopup);
   };

   const handleMenuClick = (event) => {
      setMenuAnchor(event.currentTarget);
   };
   const handleMenuClose = () => {
      setMenuAnchor(null);
   };

   const handleRadioChange = (value) => {
      setSelectedValue(value);
   };
   const handleSeeDialogOpen = () => {
      setOpenSeeEdit(true);
      setSelectedValue(post.status);
   };
   const handleSeeDialogClose = () => {
      setOpenSeeEdit(false);
   };
   const handleEdit = () => {
      handleMenuClose();
      setShowEditPopup(!showEditPopup);
   };
   const handleReport = () => {
      handleMenuClose();
      setShowReportPopup(!showReportPopup);
   };

   const { currentUser } = useContext(AuthContext);
   const { isLoading, data } = useQuery(["likes", post.id], () =>
      makeRequest.get("/likes?postId=" + post.id).then((res) => {
         return res.data;
      })
   );

   const queryClient = useQueryClient();
   //Use Mutation
   const mutation = useMutation(
      (liked) => {
         if (liked) return makeRequest.delete("/likes?postId=" + post.id);
         return makeRequest.post("/likes", { postId: post.id });
      },
      {
         onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries(["likes"]);
         },
      }
   );
   const deleteMutation = useMutation(
      (postId) => {
         return makeRequest.delete("/posts/" + postId);
      },
      {
         onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries(["posts"]);
         },
      }
   );

   const updateSeeMutation = useMutation(
      (data) => {
         return makeRequest.put(`/posts/private/${data.postId}`, data);
      },
      {
         onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries(["posts"]);
         },
      }
   );
   //End Use Mutation

   const handleSave = () => {
      if (privateRef.current && privateRef.current.savePrivate) {
         privateRef.current.savePrivate();
      }
      const updatedSelectedValue = selectedValue === 3 ? 2 : selectedValue;
      updateSeeMutation.mutate({ postId: post.id, status: updatedSelectedValue });
      setOpenSeeEdit(false);
      setMenuAnchor(null);
   };

   const handleLike = () => {
      mutation.mutate(data.includes(currentUser.id));
   };

   const handleDelete = () => {
      deleteMutation.mutate(post.id);
   };

   return (
      <div className="post">
         <div className="container">
            <div className="user">
               <div className="userInfo">
                  <img
                     src={URL_OF_BACK_END + `users/profilePic/` + post.userId}
                     onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/upload/errorImage.png";
                     }}
                     alt={""}
                  />
                  <div className="details">
                     <span
                        className="name"
                        onClick={() => {
                           window.location.href = `/profile/${post.userId}`;
                        }}
                     >
                        {post.name}
                     </span>
                     <span className="date">{moment(post.createdAt).fromNow()}</span>
                  </div>
               </div>
               <MoreHorizIcon
                  style={{
                     fontSize: "28px",
                     cursor: "pointer",
                     borderRadius: "50%",
                     transition: "background-color 0.3s",
                     alignItems: "center",
                     padding: "3px",
                  }}
                  className="more"
                  onClick={handleMenuClick}
               />
               <Popover
                  open={Boolean(menuAnchor)}
                  anchorEl={menuAnchor}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                     vertical: "bottom",
                     horizontal: "center",
                  }}
                  transformOrigin={{
                     vertical: "top",
                     horizontal: "right",
                  }}
               >
                  {post.userId === currentUser.id ? (
                     <List>
                        <ListItemButton onClick={() => handleEdit()}>
                           <ListItemIcon
                              style={{ fontSize: "18px", marginRight: "-25px" }}
                           >
                              <FontAwesomeIcon icon={faPen} />
                           </ListItemIcon>
                           <ListItemText
                              primary={trl("Chỉnh sửa bài viết")}
                              style={{ fontSize: "14px", marginRight: "50px" }}
                           />
                        </ListItemButton>
                        <Divider />
                        <ListItemButton onClick={handleSeeDialogOpen}>
                           <ListItemIcon
                              style={{ fontSize: "18px", marginRight: "-25px" }}
                           >
                              <FontAwesomeIcon icon={faLock} />
                           </ListItemIcon>
                           <ListItemText
                              primary={trl("Chỉnh sửa đối tượng")}
                              style={{ fontSize: "14px", marginRight: "50px" }}
                           />
                        </ListItemButton>
                        <Divider />

                        <ListItemButton onClick={handleDelete}>
                           <ListItemIcon
                              style={{ fontSize: "18px", marginRight: "-25px" }}
                           >
                              <FontAwesomeIcon icon={faTrashCan} />
                           </ListItemIcon>
                           <ListItemText
                              primary={trl("Xóa bài viết")}
                              style={{ fontSize: "14px", marginRight: "50px" }}
                           />
                        </ListItemButton>
                     </List>
                  ) : (
                     <List>
                        <ListItemButton className="item" onClick={() => handleReport()}>
                           <ListItemIcon
                              style={{ fontSize: "18px", marginRight: "-25px" }}
                           >
                              <ReportOutlinedIcon />
                           </ListItemIcon>
                           <ListItemText
                              primary={trl("Report")}
                              style={{ fontSize: "14px", marginRight: "50px" }}
                           />
                        </ListItemButton>
                     </List>
                  )}

                  <Dialog open={openSeeEdit} onClose={handleSeeDialogClose}>
                     <DialogTitle
                        sx={{ m: 0, p: 2, display: "flex", mt: "-5px", mb: "-10px" }}
                     >
                        <Typography
                           variant="title1"
                           style={{ flexGrow: 1, textAlign: "center" }}
                        >
                           <FontAwesomeIcon
                              style={{ marginRight: "8px", fontSize: "20px" }}
                              icon={faLock}
                           />
                           <span style={{ fontSize: "22px", fontWeight: "700" }}>
                              {trl("Chỉnh sửa đối tượng")}
                           </span>
                        </Typography>
                     </DialogTitle>
                     <Divider />
                     <DialogContent>
                        <div
                           style={{
                              display: "flex",
                              justifyContent: "flex-start",
                              alignItems: "center",
                              margin: "-10px 0 0 0",
                              flexDirection: "column",
                           }}
                        >
                           <List>
                              <ListItemButton
                                 selected={selectedValue === 0}
                                 onClick={() => handleRadioChange(0)}
                              >
                                 <ListItemIcon
                                    style={{ fontSize: "21px", marginLeft: "-10px" }}
                                 >
                                    <div
                                       style={{
                                          alignItems: "center",
                                          borderRadius: "50%",
                                          backgroundColor: "#DADDE1",
                                          width: "52px",
                                          height: "52px",
                                          justifyContent: "center",
                                          display: "flex",
                                       }}
                                    >
                                       <FontAwesomeIcon icon={faEarthAmericas} />
                                    </div>
                                 </ListItemIcon>
                                 <ListItemText
                                    style={{ marginLeft: "20px", marginRight: "80px" }}
                                 >
                                    <Typography variant="h6">{trl("Công khai")}</Typography>
                                    <Typography variant="body2" color="textSecondary">
                                       {trl(
                                          "Ai trên TinySocial cũng sẽ nhìn thấy bài viết này"
                                       )}
                                    </Typography>
                                 </ListItemText>
                                 <ListItemIcon>
                                    <Radio
                                       checked={selectedValue === 0}
                                       onChange={() => handleRadioChange(0)}
                                       name="abc"
                                    />
                                 </ListItemIcon>
                              </ListItemButton>
                              <ListItemButton
                                 selected={selectedValue === 1}
                                 onClick={() => handleRadioChange(1)}
                              >
                                 <ListItemIcon
                                    style={{ fontSize: "18px", marginLeft: "-10px" }}
                                 >
                                    <div
                                       style={{
                                          alignItems: "center",
                                          borderRadius: "50%",
                                          backgroundColor: "#DADDE1",
                                          width: "52px",
                                          height: "52px",
                                          justifyContent: "center",
                                          display: "flex",
                                       }}
                                    >
                                       <FontAwesomeIcon icon={faUserGroup} />
                                    </div>
                                 </ListItemIcon>
                                 <ListItemText
                                    style={{ marginLeft: "20px", marginRight: "80px" }}
                                 >
                                    <Typography variant="h6">{trl("Bạn bè")}</Typography>
                                    <Typography variant="body2" color="textSecondary">
                                       {trl("Bạn bè của bạn trên TinySocial")}
                                    </Typography>
                                 </ListItemText>
                                 <ListItemIcon>
                                    <Radio
                                       checked={selectedValue === 1}
                                       onChange={() => handleRadioChange(1)}
                                       name="abc"
                                    />
                                 </ListItemIcon>
                              </ListItemButton>
                              <ListItemButton
                                 selected={selectedValue === 2}
                                 onClick={() => handleRadioChange(2)}
                              >
                                 <ListItemIcon
                                    style={{ fontSize: "20px", marginLeft: "-10px" }}
                                 >
                                    <div
                                       style={{
                                          alignItems: "center",
                                          borderRadius: "50%",
                                          backgroundColor: "#DADDE1",
                                          width: "52px",
                                          height: "52px",
                                          justifyContent: "center",
                                          display: "flex",
                                       }}
                                    >
                                       <FontAwesomeIcon icon={faUserNinja} />
                                    </div>
                                 </ListItemIcon>
                                 <ListItemText
                                    style={{ marginLeft: "20px", marginRight: "80px" }}
                                 >
                                    <Typography variant="h6">
                                       {trl("Bạn bè cụ thể")}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                       {trl("Chỉ định riêng những người bạn muốn")}
                                    </Typography>
                                 </ListItemText>
                                 <ListItemIcon>
                                    <Radio
                                       checked={selectedValue === 2}
                                       onChange={() => handleRadioChange(2)}
                                       name="abc"
                                    />
                                 </ListItemIcon>
                              </ListItemButton>
                              <ListItemButton
                                 selected={selectedValue === 3}
                                 onClick={() => handleRadioChange(3)}
                              >
                                 <ListItemIcon
                                    style={{ fontSize: "18px", marginLeft: "-10px" }}
                                 >
                                    <div
                                       style={{
                                          alignItems: "center",
                                          borderRadius: "50%",
                                          backgroundColor: "#DADDE1",
                                          width: "52px",
                                          height: "52px",
                                          justifyContent: "center",
                                          display: "flex",
                                       }}
                                    >
                                       <FontAwesomeIcon icon={faLock} />
                                    </div>
                                 </ListItemIcon>
                                 <ListItemText
                                    style={{ marginLeft: "20px", marginRight: "80px" }}
                                 >
                                    <Typography variant="h6">
                                       {trl("Chỉ mình tôi")}
                                    </Typography>
                                 </ListItemText>
                                 <ListItemIcon>
                                    <Radio
                                       checked={selectedValue === 3}
                                       onChange={() => handleRadioChange(3)}
                                       name="abc"
                                    />
                                 </ListItemIcon>
                              </ListItemButton>
                           </List>
                           {selectedValue === 2 ? (
                              <Private ref={privateRef} post_id={post.id}></Private>
                           ) : (
                              ""
                           )}
                        </div>
                     </DialogContent>
                     <Divider />
                     <DialogActions>
                        <Button onClick={handleSave} color="primary">
                           {trl("Save")}
                        </Button>
                        <Button onClick={handleSeeDialogClose} color="secondary">
                           {trl("Cancel")}
                        </Button>
                     </DialogActions>
                  </Dialog>
               </Popover>
            </div>
            <div className="content">
               <Description text={post.desc}></Description>
               <Link to={`/seepost/${post.id}`}>
                  {post.type === 2 && isVideoContent ? (
                     <ReactPlayer
                        key={post.id}
                        url={URL_OF_BACK_END + `posts/videopost/` + post.id}
                        playing={false}
                        controls={true}
                        className="react-player"
                     />
                  ) : (
                     post.img && (
                        <img
                           src={URL_OF_BACK_END + `posts/videopost/` + post.id}
                           onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/upload/errorImage.png";
                           }}
                           alt={""}
                        />
                     )
                  )}
               </Link>
            </div>
            {!post.error &&
               (!hidden ? (
                  <div className="info">
                     <div className="item">
                        {isLoading ? (
                           trl("Loading")
                        ) : data.includes(currentUser.id) ? (
                           <FavoriteOutlinedIcon
                              className="shake-heart"
                              style={{ color: "red" }}
                              onClick={handleLike}
                           />
                        ) : (
                           <FavoriteBorderOutlinedIcon
                              className="white-color-heart"
                              onClick={handleLike}
                           />
                        )}
                        {data?.length < 2
                           ? trl([data?.length, " ", "Like"])
                           : trl([data?.length, " ", "Likes"])}
                     </div>

                     <div
                        className="item"
                        onClick={() => setCommentOpen(!commentOpen)}
                     >
                        <TextsmsOutlinedIcon />
                        {trl("See Comments")}
                     </div>
                     <div className="item" onClick={() => handleShare()}>
                        <ShareOutlinedIcon />
                        {trl("Share")}
                     </div>

                     <PopupWindow handleClose={handleShare} show={showSharePopup}>
                        <PostShare
                           post={post}
                           setShowSharePopup={setShowSharePopup}
                           showSharePopup={showSharePopup}
                        />
                     </PopupWindow>
                     <PopupWindow show={showEditPopup} handleClose={handleEdit}>
                        <PostEdit
                           post={post}
                           setShowEditPopup={setShowEditPopup}
                           showEditPopup={showEditPopup}
                        />
                     </PopupWindow>
                     <PopupWindow show={showReportPopup} handleClose={handleReport}>
                        <PostReporter
                           post={post}
                           setShowReportPopup={setShowReportPopup}
                           showReportPopup={showReportPopup}
                        />
                     </PopupWindow>
                  </div>
               ) : (
                  <div className="info">
                     <div className="item">
                        {isLoading ? (
                           trl("Loading")
                        ) : data.includes(currentUser.id) ? (
                           <FavoriteOutlinedIcon
                              className="shake-heart"
                              style={{ color: "red" }}
                              onClick={handleLike}
                           />
                        ) : (
                           <FavoriteBorderOutlinedIcon
                              className="white-color-heart"
                              onClick={handleLike}
                           />
                        )}
                        {data?.length < 2
                           ? trl([data?.length, " ", "Like"])
                           : trl([data?.length, " ", "Likes"])}
                     </div>
                  </div>
               ))}
            {commentOpen && <Comments postId={post.id} userId={post.userId} />}
         </div>
      </div>
   );
};

export default Post;
