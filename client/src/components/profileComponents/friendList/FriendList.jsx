import React, { useState, useEffect, useCallback } from "react";
import { makeRequest } from "../../../axios";
import { Link } from "react-router-dom";
import "./friendList.scss";

const FriendList = ({ user_id }) => {
  const [friends, setFriends] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadFriends = useCallback(async () => {
    try {
      const response = await makeRequest.post("/friendship/get_friends", {
        user_id: user_id,
        offset: offset,
      });
      //console.log(offset);
      setFriends([...friends, ...response.data]);
      if (response.data.length !== 0) setOffset(offset + 10);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch friends:", error);
    }
  }, [user_id, offset, friends]);

  useEffect(() => {
    //loadFriends();
  }, [loadFriends]);

  const handleShowMore = () => {
    loadFriends();
  };
  if (loading) loadFriends();

  return (
    <div className="friend-list">
      <h1>Friends List</h1>

      <div className="container">
        {friends.map((friend) => (
          <div className="user" key={friend.id}>
            <div className="userInfo">
              <img src={"/upload/" + friend.profilePic} alt="" />
              <div className="details">
                <Link
                  to={`/profile/${friend.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <span className="name">{friend.name}</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      {loading && <p>Loading...</p>}
      {!loading && <button onClick={handleShowMore}>Show More</button>}
    </div>
  );
};

export default FriendList;