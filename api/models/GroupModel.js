import { db } from "../connect.js";

export const getGroupById = (groupId, userId, callback) => {
   const q = `
        SELECT t.*, j.status AS join_status
        FROM teams t
        LEFT JOIN joins j ON t.id = j.group_id AND j.user_id = ?
        WHERE t.id = ?;
    `;

   db.query(q, [userId, groupId], (err, data) => {
      if (err) return callback(err);
      return callback(null, data);
   });
}

export const getGroupAvatarById = (groupId, callback) => {
   const q = "SELECT group_avatar FROM teams WHERE id = ?";

   db.query(q, [groupId], (err, data) => {
      if (err) return callback(err);
      if (data.length === 0) return callback(new Error('No avatar found for the provided group ID'));
      return callback(null, data);
   });
};

export const deletePostsByGroupId = (groupId, callback) => {
   const query = `
       DELETE p FROM posts p
       JOIN group_posts gp ON p.id = gp.post_id
       WHERE gp.group_id = ?
   `;
   db.query(query, [groupId], (err, results) => {
      if (err) return callback(err);
      return callback(null, results);
   });
};

export const deleteGroupById = (groupId, callback) => {
   const query = "DELETE FROM teams WHERE id = ?";
   db.query(query, [groupId], (err, results) => {
      if (err) return callback(err);
      return callback(null, results);
   });
};

export const getGroupsByUserId = (userId, callback) => {
   const q = "SELECT * FROM teams INNER JOIN joins ON teams.id = joins.group_id WHERE joins.user_id = ? AND joins.status = 1";

   db.query(q, [userId], (err, data) => {
      if (err) return callback(err);
      return callback(null, data);
   });
}

export const getGroupsByFollowedUsers = (userId, callback) => {
   const q = `
   SELECT DISTINCT teams.*
   FROM teams
   INNER JOIN joins AS j1 ON teams.id = j1.group_id
   INNER JOIN relationships AS r ON j1.user_id = r.followedUserId
   LEFT JOIN joins AS j2 ON teams.id = j2.group_id AND j2.user_id = ? AND j2.status = 1
   WHERE r.followerUserId = ? AND j1.status = 1 AND j2.id IS NULL
   `;

   db.query(q, [userId, userId], (err, data) => {
      if (err) return callback(err, null);
      return callback(null, data);
   });
};

export const getAllGroups = (callback) => {
   const q = "SELECT * FROM teams";

   db.query(q, (err, data) => {
      if (err) return callback(err, null);
      return callback(null, data);
   });
};

export const createGroup = (groupName, privacyLevel, createdBy, callback) => {
   const q = "INSERT INTO teams(group_name, created_by, creation_at, group_avatar, privacy_level) VALUES (?, ?, NOW(), 'https://hoanghamobile.com/tin-tuc/wp-content/uploads/2023/08/hinh-nen-anime-dep.jpg', ?)";

   db.query(q, [groupName, createdBy, privacyLevel], (err, result) => {
      if (err) return callback(err);

      // Nhận ID của nhóm mới được tạo
      const groupId = result.insertId;

      // Thêm người dùng vào nhóm mới với role là quản trị viên
      const addToJoinsQuery = "INSERT INTO joins(user_id, group_id, joined_date, role, status) VALUES (?, ?, NOW(), ?, ?)";

      db.query(addToJoinsQuery, [createdBy, groupId, 1, 1], (err, result) => {
         if (err) return callback(err);
         return callback(null, { groupId: groupId, ...result });
      });
   });
}

export const checkIfUserIsGroupLeader = (userId, groupId, callback) => {
   const query = "SELECT * FROM joins WHERE user_id = ? AND group_id = ? AND role = 1";
   db.query(query, [userId, groupId], (err, results) => {
      if (err) return callback(err);
      if (results.length > 0) return callback(null, true); // Người dùng là trưởng nhóm
      return callback(null, false); // Người dùng không phải là trưởng nhóm
   });
};

export const checkIfOnlyLeaderRemains = (groupId, callback) => {
   const query = "SELECT COUNT(*) AS memberCount FROM joins WHERE group_id = ?";
   db.query(query, [groupId], (err, results) => {
      if (err) return callback(err);
      if (results[0].memberCount === 1) return callback(null, true); // Chỉ còn 1 thành viên trong nhóm
      return callback(null, false); // Còn nhiều hơn 1 thành viên trong nhóm
   });
};

export const updateGroupAvatar = (groupId, avatar, callback) => {
   const q = "UPDATE teams SET `group_avatar`=? WHERE id=? ";

   db.query(q, [avatar, groupId], (err, data) => {
      if (err) return callback(err);
      if (data.affectedRows > 0) return callback(null, "Updated!");
      return callback("You can update only your group!");
   });
};

export const searchGroupsBySearchText = (searchText, userId, callback) => {
   const sqlQuery = `
        SELECT 
            teams.*, 
            (
                SELECT COUNT(*)
                FROM joins
                WHERE teams.id = joins.group_id AND joins.status = 1
            ) AS member_count,
            IF(joined_table.user_id IS NULL, 0, IF(MAX(joins.status) = 1, 2, 1)) AS joined
        FROM 
            teams
        LEFT JOIN 
            joins ON teams.id = joins.group_id AND joins.user_id = ?
        LEFT JOIN (
            SELECT 
                group_id, 
                user_id
            FROM 
                joins
            WHERE 
                user_id = ?
        ) AS joined_table ON teams.id = joined_table.group_id
        WHERE 
            teams.group_name LIKE ? OR teams.group_intro LIKE ?
        GROUP BY 
            teams.id
        ORDER BY 
            teams.creation_at DESC
    `;

   const likeSearchText = `%${searchText}%`;
   db.query(sqlQuery, [userId, userId, likeSearchText, likeSearchText], (err, results) => {
      if (err) return callback(err, null);
      return callback(null, results);
   });
};

export const getPendingPostsByGroupId = (groupId, offset, limit, callback) => {
   const sqlOffset = (offset - 1) * limit;
   const query = `
        SELECT posts.id, posts.desc, posts.img, posts.createdAt, group_posts.user_id, group_posts.status,
               users.name, users.profilePic
        FROM group_posts
        INNER JOIN posts ON group_posts.post_id = posts.id
        INNER JOIN users ON posts.userId = users.id
        WHERE group_posts.group_id = ? AND group_posts.status = 0
        ORDER BY posts.createdAt DESC
        LIMIT ? OFFSET ?`;

   db.query(query, [groupId, limit, sqlOffset], (err, data) => {
      if (err) return callback(err);
      return callback(null, data);
   });
};

export const approveGroupPost = (postId, groupId, callback) => {
   const query = `
        UPDATE group_posts
        SET status = 1
        WHERE post_id = ? AND group_id = ?`;

   db.query(query, [postId, groupId], (err, result) => {
      if (err) return callback(err);
      if (result.affectedRows === 0) {
         return callback(new Error("No post found or you don't have the permission."));
      }
      return callback(null, { message: "Post approved successfully." });
   });
};

export const rejectGroupPost = (postId, groupId, callback) => {
   const query = `
        UPDATE group_posts
        SET status = -1
        WHERE post_id = ? AND group_id = ?`;

   db.query(query, [postId, groupId], (err, result) => {
      if (err) return callback(err);
      if (result.affectedRows === 0) {
         return callback(new Error("No post found or you don't have the permission."));
      }
      return callback(null, { message: "Post rejected successfully." });
   });
};

export const getUserFromGroupPost = (postId, callback) => {
   const query = `SELECT user_id FROM group_posts WHERE post_id = ? LIMIT 1`;
   db.query(query, [postId], (err, rows) => {
      if (err) return callback(err);
      if (rows.length === 0) {
         return callback(new Error("No post found in assigned group!"));
      }
      return callback(null, rows[0].user_id);
   });
};

export const getPendingPostsCount = (groupId, callback) => {
   const q = "SELECT COUNT(*) as pendingPostsCount FROM group_posts WHERE group_id = ? AND status = 0";

   db.query(q, [groupId], (err, data) => {
      if (err) return callback(err);
      return callback(null, data);
   });
};

export const getJoinRequestsCount = (groupId, callback) => {
   const q = "SELECT COUNT(*) as joinRequestsCount FROM joins WHERE group_id = ? AND status = 0";

   db.query(q, [groupId], (err, data) => {
      if (err) return callback(err);
      return callback(null, data);
   });
};

export const getPostCountByStatusForUser = (groupId, userId, callback) => {
   const query = `
        SELECT status, COUNT(*) as count
        FROM group_posts
        WHERE group_id = ? AND user_id = ?
        GROUP BY status
    `;
   db.query(query, [groupId, userId], (err, results) => {
      if (err) return callback(err);
      const counts = {
         pending: 0,
         rejected: 0,
         approved: 0
      };
      results.forEach(row => {
         switch (row.status) {
            case 0:
               counts.pending = row.count;
               break;
            case -1:
               counts.rejected = row.count;
               break;
            case 1:
               counts.approved = row.count;
               break;
         }
      });
      callback(null, counts);
   });
}

export const getUserPostsByGroupIdAndStatus = (userId, groupId, status, offset, limit, callback) => {
   const sqlOffset = (offset - 1) * limit;
   const query = `
       SELECT posts.id, posts.desc, posts.img, posts.createdAt, group_posts.user_id, group_posts.status,
              users.name, users.profilePic
       FROM group_posts
       INNER JOIN posts ON group_posts.post_id = posts.id
       INNER JOIN users ON group_posts.user_id = users.id
       WHERE group_posts.group_id = ? AND group_posts.status = ? AND group_posts.user_id = ?
       ORDER BY posts.createdAt DESC
       LIMIT ? OFFSET ?`;

   db.query(query, [groupId, status, userId, limit, sqlOffset], (err, data) => {
      if (err) return callback(err);
      return callback(null, data);
   });
};