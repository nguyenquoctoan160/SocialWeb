import { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./stories.scss";
import { AuthContext } from "../../context/authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest, URL_OF_BACK_END } from "../../axios";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import MovieIcon from "@mui/icons-material/Movie";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import FlipCube from "../loadingComponent/flipCube/FlipCube";
import Slider from "react-slick";
import { useLanguage } from "../../context/languageContext";

const Stories = () => {
   const { trl } = useLanguage();
   const { currentUser } = useContext(AuthContext);
   const inputRef = useRef(null);
   const navigate = useNavigate();
   const [currentSlide, setCurrentSlide] = useState(0);

   const handleStoryClick = (userId) => {
      navigate('/stories', { state: { selectedUserId: userId } });
   };

   const { isLoading, error, data } = useQuery(["stories"], () =>
      makeRequest.get("/stories/story").then((res) => res.data)
   );

   const [users, setUsers] = useState({});
   const [userLatestStories, setUserLatestStories] = useState({});
   const [fetchedUserIds, setFetchedUserIds] = useState(new Set());
   const [selectedImage, setSelectedImage] = useState(null);
   const [openAdd, setOpenAdd] = useState(false);
   const [file, setFile] = useState(null);
   const queryClient = useQueryClient();

   const mutation = useMutation(
      async (newStory) => {
         try {
            return await makeRequest.post("/stories/add", newStory);
         } catch (error) {
            alert(error.response.data);
         }
      },
      {
         onSuccess: () => {
            queryClient.invalidateQueries(["stories"]);
         },
      }
   );

   const handleDialogOpen = () => {
      setOpenAdd(true);
   };

   const handleDialogClose = () => {
      setOpenAdd(false);
      setSelectedImage(null);
      setFile(null);
   };

   const handleImageChange = (e) => {
      const file = e.target.files[0];
      setSelectedImage(URL.createObjectURL(file));
   };

   const handleAddStoryClick = async (e) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append("file", file);
      mutation.mutate(formData);
      setFile(null);
      setSelectedImage(null);
      setOpenAdd(false);
   };

   useEffect(() => {
      const fetchUser = async (userId) => {
         try {
            const response = await makeRequest.get(`/users/find/${userId}`);
            const user = response.data;
            setUsers((prevUsers) => ({
               ...prevUsers,
               [userId]: user,
            }));
         } catch (error) {
            console.error("Error fetching user:", error);
         }
      };

      if (data) {
         // Sắp xếp data theo thời gian tạo mới nhất
         const sortedData = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

         const newUsersToFetch = sortedData.filter(story => !fetchedUserIds.has(story.userId));
         if (newUsersToFetch.length > 0) {
            const userIdsToFetch = newUsersToFetch.map(story => story.userId);
            userIdsToFetch.forEach(userId => setFetchedUserIds(prev => new Set(prev).add(userId)));
            Promise.all(userIdsToFetch.map(fetchUser));
         }
      }
   }, [data, fetchedUserIds]);

   useEffect(() => {
      if (data && Object.keys(users).length > 0) {
         const latestStories = {};
         data.forEach((story) => {
            if (!latestStories[story.userId] || story.id > latestStories[story.userId].id) {
               latestStories[story.userId] = story;
            }
         });
         setUserLatestStories(latestStories);
      }
   }, [data, users]);

   const settings = {
      dots: true,
      infinite: false,
      speed: 500,
      slidesToShow: 4,
      slidesToScroll: 1,
      cssEase: "ease-in-out",
   };

   const slides = [
      <div className="story" key={1}>
         <img
            src={URL_OF_BACK_END + `users/profilePic/` + currentUser.id}
            onError={(e) => {
               e.target.onerror = null;
               e.target.src = "/upload/errorImage.png";
            }}
            alt=""
         />
         <span>{currentUser.name}</span>
         <button onClick={handleDialogOpen}>+</button>

         <Dialog open={openAdd} onClose={handleDialogClose}>
            <DialogTitle
               sx={{
                  m: 0,
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  mt: "-5px",
                  mb: "-10px",
               }}
            >
               <MovieIcon sx={{ marginRight: "8px" }} />
               <Typography variant="title1" sx={{ flexGrow: 1 }}>
                  {trl("Create a story")}
               </Typography>
            </DialogTitle>
            <Divider />
            <DialogContent>
               <Box
                  sx={{
                     display: "flex",
                     flexDirection: "column",
                     alignItems: "center",
                     marginBottom: "8px",
                  }}
               >
                  <Typography
                     variant="body1"
                     sx={{ alignSelf: "flex-start", mb: "25px", textAlign: "left" }}
                  >
                     {trl("Câu chuyện là hình ảnh/video được đăng lên và sẽ biến mất sau 24 giờ")}
                  </Typography>
                  <input
                     type="file"
                     accept="image/*, video/*"
                     ref={inputRef}
                     onChange={(e) => {
                        if (isImageAndVideo(e.target.files[0])) {
                           setFile(e.target.files[0]);
                           handleImageChange(e);
                        } else {
                           inputRef.current.value = "";
                        }
                     }}
                  />
                  {selectedImage && isImage(file) ? (
                     <img
                        src={selectedImage}
                        onError={(e) => {
                           e.target.onerror = null;
                           e.target.src = "/upload/errorImage.png";
                        }}
                        alt=""
                        style={{ marginTop: "8px", maxWidth: "300px" }}
                     />
                  ) : isImageAndVideo(file) ? (
                     <video
                        src={selectedImage}
                        preload="metadata"
                        onError={(e) => {
                           e.target.onerror = null;
                           e.target.src = "/upload/errorImage.png";
                        }}
                        style={{ marginTop: "8px", maxWidth: "300px" }}
                     />
                  ) : (
                     <div></div>
                  )}
               </Box>
            </DialogContent>
            <Divider />
            <DialogActions>
               <Button onClick={handleAddStoryClick} color="primary">
                  {trl("Add Story")}
               </Button>
               <Button onClick={handleDialogClose} color="secondary">
                  {trl("Cancel")}
               </Button>
            </DialogActions>
         </Dialog>
      </div>,
   ];

   if (error) {
      return "Something went wrong";
   } else if (isLoading) {
      return <FlipCube />;
   } else {
      Object.keys(userLatestStories).forEach((userId) => {
         const user = users[userId];
         const latestStory = userLatestStories[userId];
         if (!user || !latestStory) {
            return; // Skip if user or story data is not available
         }
         slides.push(
            <div className="story" key={latestStory.id} onClick={() => handleStoryClick(latestStory.userId)}>
               <div className="profile-pic">
                  <img
                     src={URL_OF_BACK_END + `users/profilePic/` + latestStory.userId}
                     onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/upload/errorImage.png";
                     }}
                     alt=""
                  />
               </div>
               <div className="story-content">
                  {latestStory.img.endsWith("mp4") ||
                     latestStory.img.endsWith("avi") ||
                     latestStory.img.endsWith("mov") ? (
                     <video
                        src={URL_OF_BACK_END + `stories/image/` + latestStory.id}
                        preload="metadata"
                     />
                  ) : (
                     <img
                        src={URL_OF_BACK_END + `stories/image/` + latestStory.id}
                        onError={(e) => {
                           e.target.onerror = null;
                           e.target.src = "/upload/errorImage.png";
                        }}
                        alt=""
                     />
                  )}
                  <span>{user.name}</span>
               </div>
            </div>
         );
      });
   }

   return (
      <div className="stories">
         <Slider
            {...settings}
            afterChange={(currentSlide) => setCurrentSlide(currentSlide)}
            className="slider-container"
         >
            {slides}
         </Slider>
      </div>
   );
};

export default Stories;

function isImageAndVideo(file) {
   return file && (file["type"].split("/")[0] === "image" || file["type"].split("/")[0] === "video");
}

function isImage(file) {
   return file && file["type"].split("/")[0] === "image";
}

