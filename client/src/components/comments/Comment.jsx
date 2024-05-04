import { URL_OF_BACK_END } from "../../axios";
import moment from "moment";
import { AuthContext } from "../../context/authContext";
import { useContext, useEffect, useState } from "react";
import { useLanguage } from "../../context/languageContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import "./comment.scss";
import PopupWindow from "../PopupComponent/PopupWindow";
import { useQueryClient } from "@tanstack/react-query";
const Comment = ({ comment }) => {
  const { currentUser } = useContext(AuthContext);
  const { trl, language } = useLanguage();
  const [isDelete, setDelete] = useState(false);
  const queryClient = useQueryClient();
  useEffect(() => {
    if (language === "jp") {
      moment.locale("ja");
    } else if (language === "vn") {
      moment.locale("vi");
    } else {
      moment.locale("en");
    }
  }, [language]);
  const handleDeleteComment = () => {};
  return (
    <div className="comment" key={comment.id}>
      <PopupWindow
        show={isDelete}
        handleClose={() => {
          setDelete(false);
        }}
      >
        <div>{trl("Do you want to DELETE this comment")}</div>
        <div>
          <button>{trl("Yes")}</button>
          <button
            onClick={() => {
              setDelete(false);
            }}
          >
            {trl("No")}
          </button>
        </div>
      </PopupWindow>
      <img
        src={URL_OF_BACK_END + `users/profilePic/` + comment.userId}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "/upload/errorImage.png";
        }}
        alt={""}
        onClick={() => {
          window.location.href = `/profile/${comment.userId}`;
        }}
      />
      <div className="infocomment">
        <span
          onClick={() => {
            window.location.href = `/profile/${comment.userId}`;
          }}
        >
          {comment.name}{" "}
          <span className="date">{moment(comment.createdAt).fromNow()}</span>
        </span>

        <p>{comment.desc}</p>
      </div>

      <div className="editting">
        {currentUser.id === comment.userId ? (
          <FontAwesomeIcon
            icon={faTrash}
            onClick={() => {
              setDelete(true);
            }}
          />
        ) : (
          <FontAwesomeIcon icon={faTriangleExclamation}></FontAwesomeIcon>
        )}
      </div>
    </div>
  );
};
export default Comment;