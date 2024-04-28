import "./navbar.scss";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { DarkModeContext } from "../../context/darkModeContext";
import { AuthContext } from "../../context/authContext";
import {
  Popover,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ListBoxChat from "./ListBoxChat";
import {
  faArrowRightFromBracket,
  faCircleExclamation,
  faGear,
  faCaretDown,
} from "@fortawesome/free-solid-svg-icons";
import ListFriendRequest from "./ListFriendRequest";
import { makeRequest, URL_OF_BACK_END, WEBSOCKET_BACK_END } from "../../axios";
import ListNotification from "./ListNotification";
import ListMessages from "./ListMessages";
import { ChatContext } from "./ChatContext";
import PopupWindow from "../PopupComponent/PopupWindow";
import LanguageSwitcher from "../languageSwitcher/LanguageSwitcher";
import { useLanguage } from "../../context/languageContext";
const Navbar = () => {
  const { toggle, darkMode } = useContext(DarkModeContext);
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [content, setContent] = useState("");
  const [request_number, setRequestNumber] = useState(0);
  const [notification_number, setNotificationNumber] = useState(0);
  const { ws, setWS } = useContext(ChatContext);
  const [isCalling, setIsCalling] = useState(false);
  const [callId, setCallId] = useState(0);
  const [callName, setCallName] = useState("");
  const { trl } = useLanguage();
  const update_request_number = async () => {
    try {
      const response = await makeRequest.get("/friendship/count");

      setRequestNumber(response.data); // Hoặc request_number = response.data nếu đây là biến ngoài hàm
    } catch (error) {
      setRequestNumber(-1); // Xử lý lỗi và gán giá trị mặc định
    }
  };
  const handleCloseCall = () => {
    setIsCalling(false);
  };
  const handleAcceptCall = () => {
    window.open(`/call/${callId}`, "_blank");
    handleCloseCall();
  };
  const handleDenyCall = () => {
    ws.send(
      JSON.stringify({
        type: "deny",

        friendId: callId,
        message: "User deny your call",
      })
    );
    handleCloseCall();
  };
  const update_notification_number = async () => {
    try {
      const res = await makeRequest.get("/notifications/count");
      setNotificationNumber(res.data);
    } catch (error) {
      setNotificationNumber(-1);
    }
  };

  update_request_number();
  update_notification_number();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await makeRequest.post("/auth/logout");
      logout();
      navigate("/login");
    } catch (err) {
      console.log(err);
    }
  };

  const handlePopover = (event) => {
    event.stopPropagation();
    const iconId = event.currentTarget.id;
    let contentType = null;
    switch (iconId) {
      case "friend-icon":
        contentType = "friend";
        break;
      case "chat-icon":
        contentType = "chat";
        break;
      case "noti-icon":
        contentType = "noti";
        break;
      case "profile":
        contentType = "profile";
        break;
      default:
        break;
    }
    iconId === "profile"
      ? setAnchorEl(event.currentTarget.parentElement.parentElement)
      : setAnchorEl(
        event.currentTarget.parentElement.parentElement.parentElement
      );
    setContent(contentType);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  const [searchText, setSearchText] = useState("");

  const handleSearch = () => {
    if (searchText.trim() !== "") {
      window.location.href = `/search/${searchText}/people`;
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  ///Show messages in navbar
  const [mess, setMess] = useState(null);
  let [messLoading, setMessLoading] = useState(true);
  const [messError, setMessError] = useState(null);
  const updateMessage = () => {
    //console.log("call");
    makeRequest
      .get("/messages/lastest")
      .then((res) => {
        setMess(res.data);
      })
      .catch((err) => {
        setMessError(err);
      })
      .finally(() => {
        //console.log("call");
        setMessLoading(false);
      });
  };
  useEffect(() => {
    if (messLoading) {
      updateMessage();
    }
  }, [messLoading]);
  useEffect(() => {
    if (!ws) {
      const socket = new WebSocket(WEBSOCKET_BACK_END + `/index`);
      socket.onopen = () => {
        console.log("Connected");
      };
      socket.onmessage = (event) => {
        if (typeof event.data === "string") {
          if (event.data === "A Request has sent or cancelled") {
            update_request_number();
          } else if (event.data === "New notification") {
            update_notification_number();
          } else if (event.data === "New message or seen") {
            updateMessage();
          } else {
            try {
              const data = JSON.parse(event.data);
              if (data.type === "call") {
                setCallId(data.id);
                setCallName(data.name);
                setIsCalling(true);
              } else if (data.type === "quit") {
                setIsCalling(false);
              }
            } catch (error) { }
          }
        } else {
        }
      };
      socket.onclose = () => {
        console.log("Closed");
      };
      setWS(socket);
    }
  }, [ws, setWS]);

  return (
    <div className="navbar">
      <ListBoxChat></ListBoxChat>
      <PopupWindow show={isCalling} handleClose={handleDenyCall}>
        <div className="callingPopup">
          {callId > 0 && (
            <img
              src={URL_OF_BACK_END + `users/profilePic/` + callId}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/upload/errorImage.png";
              }}
              alt={""}
            />
          )}
          <h1>
            {callName} {trl("đang gọi bạn")}
          </h1>
        </div>
        <div className="callingButton">
          <button onClick={handleAcceptCall}>{trl("Nghe")}</button>
          <button onClick={handleDenyCall}>{trl("Từ chối")}</button>
        </div>
      </PopupWindow>
      <div className="left">
        <span
          style={{ cursor: "pointer" }}
          onClick={() => (window.location.href = "/")}
        >
          <img
            src="/upload/socialicon.png"
            alt=""
            onError={(e) => {
              //console.error(e);
            }}
          ></img>{" "}
          TinySocial
        </span>
        <HomeOutlinedIcon />
        {darkMode ? (
          <WbSunnyOutlinedIcon onClick={toggle} />
        ) : (
          <DarkModeOutlinedIcon onClick={toggle} />
        )}
        <GridViewOutlinedIcon />
        <div className="search">
          <SearchOutlinedIcon onClick={handleSearch} />
          <input
            type="text"
            placeholder={trl("Search...")}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
        <LanguageSwitcher></LanguageSwitcher>
      </div>
      <div className="right">
        <div className="icon-container">
          <div className={request_number !== 0 ? "number" : "non-number"}>
            {request_number > 9 ? "9+" : request_number}
          </div>
          <PersonOutlinedIcon
            className="icon"
            onClick={handlePopover}
            style={{ cursor: "pointer", fontSize: "25px" }}
            id="friend-icon"
          />
        </div>
        <div className="icon-container">
          {messError ? (
            <div className="number">X</div>
          ) : messLoading ? (
            <div className="number">...</div>
          ) : (
            <div className={mess.number !== 0 ? "number" : "non-number"}>
              {mess.number > 9 ? "9+" : mess.number}
            </div>
          )}
          <EmailOutlinedIcon
            className="icon"
            onClick={handlePopover}
            style={{ cursor: "pointer", fontSize: "25px" }}
            id="chat-icon"
          />
        </div>
        <div className="icon-container">
          <div className={notification_number !== 0 ? "number" : "non-number"}>
            {notification_number > 9 ? "9+" : notification_number}
          </div>
          <NotificationsOutlinedIcon
            className="icon"
            onClick={handlePopover}
            style={{ cursor: "pointer", fontSize: "25px" }}
            id="noti-icon"
          />
        </div>
        <div
          className="user-container"
          onClick={handlePopover}
          style={{ cursor: "pointer" }}
          id="profile"
        >
          <img
            src={URL_OF_BACK_END + `users/profilePic/` + currentUser.id}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/upload/errorImage.png";
            }}
            alt={""}
          />
          <span>{currentUser.name}</span>
          <FontAwesomeIcon icon={faCaretDown} />
        </div>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          {content === "profile" && (
            <List>
              <ListItemButton>
                <ListItemIcon
                  style={{ fontSize: "20px", marginRight: "-25px" }}
                >
                  <FontAwesomeIcon icon={faGear} />
                </ListItemIcon>
                <ListItemText
                  primary={trl("Cài đặt riêng tư")}
                  style={{ marginRight: "100px" }}
                />
              </ListItemButton>
              <ListItemButton>
                <ListItemIcon
                  style={{ fontSize: "20px", marginRight: "-25px" }}
                >
                  <FontAwesomeIcon icon={faCircleExclamation} />
                </ListItemIcon>
                <ListItemText
                  primary={trl("Đóng góp ý kiến")}
                  style={{ marginRight: "100px" }}
                />
              </ListItemButton>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon
                  style={{ fontSize: "20px", marginRight: "-25px" }}
                >
                  <FontAwesomeIcon icon={faArrowRightFromBracket} />
                </ListItemIcon>
                <ListItemText
                  primary={trl("Logout")}
                  style={{ marginRight: "100px" }}
                />
              </ListItemButton>
            </List>
          )}
          {content === "friend" && <ListFriendRequest></ListFriendRequest>}

          {content === "noti" && <ListNotification></ListNotification>}

          {content === "chat" && mess && (
            <ListMessages
              handleClose={handleClose}
              ListMessages={mess.list}
            ></ListMessages>
          )}
        </Popover>
      </div>
    </div>
  );
};
export default Navbar;
