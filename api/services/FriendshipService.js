import { findFriendshipByUserAndFriendAndStatus, getFriend, getFriendByName } from "../models/FriendShipModel.js";

export const getUserFriend = (userId, offset, limit, callback) => {
  getFriend(userId, limit, offset, (err, data) => {
    if (err) return callback(err, null);
    return callback(null, data);
  });
};
export const getUserFriendByName = (
  userId,
  offset,
  limit,
  callback,
  searchName
) => {
  getFriendByName(userId, searchName, limit, offset, (err, data) => {
    if (err) return callback(err, null);
    return callback(null, data);
  });
};
export const checkFriendshipStatus = async (user_id1, user_id2) => {
  if (user_id1===user_id2)
  return -1;
  const outgoingRequests = await findFriendshipByUserAndFriendAndStatus(
    user_id1,
    user_id2,
    0
  );
  if (outgoingRequests.length > 0) {
    return 1; // đã gửi lời mời kết bạn
  }

  const incomingRequests = await findFriendshipByUserAndFriendAndStatus(
    user_id2,
    user_id1,
    0
  );
  if (incomingRequests.length > 0) {
    return 2; // đã nhận được lời mời kết bạn
  }

  const friendships = await findFriendshipByUserAndFriendAndStatus(
    user_id1,
    user_id2,
    1
  );
  if (friendships.length > 0) {
    return 3; // đã là bạn bè
  }

  return 0; // chưa là bạn bè
};
