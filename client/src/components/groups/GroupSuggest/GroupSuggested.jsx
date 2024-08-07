import React from "react";
import { useLanguage } from "../../../context/languageContext";
import { useNavigate } from "react-router-dom";
import { URL_OF_BACK_END } from "../../../axios";
import "./groupSuggested.scss";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

const GroupSuggested = ({ group }) => {
   const { trl } = useLanguage();
   const navigate = useNavigate();

   const viewGroup = () => {
      navigate(`/groups/${group.id}`);
   };

   const getDefaultOrUploadedAvatar = () => {
      const defaultAvatar =
         "https://hoanghamobile.com/tin-tuc/wp-content/uploads/2023/08/hinh-nen-anime-dep.jpg";

      return group.group_avatar === defaultAvatar
         ? group.group_avatar
         : `${URL_OF_BACK_END}groups/${group.group_id}/avatar`;
   };

   return (
      <div className="card-join">
         <div className="card-info">
            <img
               src={getDefaultOrUploadedAvatar()}
               onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/upload/errorImage.png";
               }}
               alt=""
            />
            <span className="group-name">{group.group_name}</span>
         </div>
         <div className="group-action">
            <button className="view" onClick={viewGroup}>
               {trl("Xem nhóm")}
            </button>
            <button className="more">
               <MoreHorizIcon fontSize="small" />
            </button>
         </div>
      </div>
   );
};

export default GroupSuggested;
